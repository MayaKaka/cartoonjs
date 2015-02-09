
define(function (require) {
	"use strict";

var cartoon = require('cartoon'),
	Box2D = require('physics/Box2D'),
	DisplayObject = cartoon.DisplayObject;

var b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef,
    b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef,
    b2WeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef,
    b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef,
	b2World = Box2D.Dynamics.b2World,
	b2AABB = Box2D.Collision.b2AABB,
	b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

var PhysicsWorld = DisplayObject.extend({
	
	type: 'PhysicsWorld',
	
	debug: false,
	
	_debugCtx: null,
	_world: null,
	_scale: -1,
	_worldSize: null,
	_mouseJoint: null,

	init: function(props) {
		this._super(props);
		this._initWorld({ width: props.worldWidth, height: props.worldHeight }, props.scale || 50);
		this._initGround();
	},

	update: function(delta) {
		var world = this._world;

		world.Step(delta / 1000, 10, 10);
		world.ClearForces();
		
		this._updateObjects();
	},
	
	add: function(child, data) {
		this._super(child);

		if (!data) data = {};
		if (!data.type) return;

        var world = this._world,
        	scale = this._scale;
        
        var bodyDef = new b2BodyDef();
        bodyDef.type = data.type === 'static' ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
        bodyDef.position.x = child.x / scale;
        bodyDef.position.y = child.y / scale;

        var fixDef = new b2FixtureDef();
        fixDef.density = data.density || 1; // 密度
        fixDef.friction = data.friction || 0.5; // 摩擦力
        fixDef.restitution = data.restitution || 0.2; // 恢复系数
        
        if (child.radius) {
       		fixDef.shape = new b2CircleShape(child.radius/scale);
       	}
       	else if (data.shape === 'circle') {
        	fixDef.shape = new b2CircleShape(child.width/scale/2);
        } 
        else {
        	fixDef.shape = new b2PolygonShape();
        	fixDef.shape.SetAsBox(child.width/scale/2, child.height/scale/2);
        }
        child.style('transform', { translateX: -child.width/2, translateY: -child.height/2 });
         
        var fixture = world.CreateBody(bodyDef).CreateFixture(fixDef);
        fixture.m_userData = { displayObj: child };
        child._b2Fixture = fixture;
	},
	
	remove: function(child) {
		this._super(child);

		var world = this._world,
			fixture = child._b2Fixture;
		if (fixture) {
			world.DestroyBody(fixture.m_body);
		}
	},

	addJoint: function(obj01, obj02, anchor) {
		var world = this._world,
			scale = this._scale,
			body01 = obj01._b2Fixture.m_body,
			body02 = obj02._b2Fixture.m_body,

		anchor = anchor || {};

		var	center = body01.GetWorldCenter(), 
			dx = (anchor.x || 0) / scale,
			dy = (anchor.y || 0) / scale;

		var jointDef = new b2RevoluteJointDef();
		jointDef.Initialize(body01, body02, new b2Vec2(center.x + dx, center.y + dy));

		var joint = world.CreateJoint(jointDef);
	},
	
	addWeld: function(obj01, obj02, anchor) {
		var world = this._world,
			scale = this._scale,
			body01 = obj01._b2Fixture.m_body,
			body02 = obj02._b2Fixture.m_body,

		anchor = anchor || {};

		var	center = body01.GetWorldCenter(), 
			dx = (anchor.x || 0) / scale,
			dy = (anchor.y || 0) / scale;

		var jointDef = new b2WeldJointDef();
		jointDef.Initialize(body01, body02, new b2Vec2(center.x + dx, center.y + dy));

		var joint = world.CreateJoint(jointDef);
	},

	addDistance: function(obj01, obj02) {
		var world = this._world,
			body01 = obj01._b2Fixture.m_body,
			body02 = obj02._b2Fixture.m_body;

		var jointDef = new b2DistanceJointDef();
		jointDef.Initialize(body01, body02, body01.GetWorldCenter(), body02.GetWorldCenter());

		var joint = world.CreateJoint(jointDef);
	},

	addMouse: function(mouseX, mouseY) {
		var world = this._world,
			scale = this._scale;
		mouseX = mouseX/scale;
		mouseY = mouseY/scale;

		var body = this.getBodyAtMouse(mouseX, mouseY);
        if (body) {
           var jointDef = new b2MouseJointDef();
           jointDef.bodyA = world.GetGroundBody();
           jointDef.bodyB = body;
           jointDef.target.Set(mouseX, mouseY);
           jointDef.collideConnected = true;
           jointDef.maxForce = 300.0 * body.GetMass();
           
           var mouseJoint = this._mouseJoint = world.CreateJoint(jointDef);
           body.SetAwake(true);
        }
	},

	getBodyAtMouse: function(mouseX, mouseY) {
		var world = this._world,
			vec = new b2Vec2(mouseX, mouseY),
			aabb = new b2AABB();
	    aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
	    aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);

	    var body = null;
	    world.QueryAABB(function getBodyCallBack(fixture) {
		    if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
		       if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), vec)) {
		          body = fixture.GetBody();
		          return false;
		       }
		    }
		    return true;
		 }, aabb);

	    return body;
	},
	
	moveMouse: function(mouseX, mouseY) {
		var mouseJoint = this._mouseJoint;
		if (mouseJoint) {
			var scale = this._scale;
			mouseX = mouseX/scale;
			mouseY = mouseY/scale;
			mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
		}
	},

	removeMouse: function() {
		var mouseJoint = this._mouseJoint;
		if (mouseJoint) {
			this._world.DestroyJoint(mouseJoint);
	        this._mouseJoint = null;
		}
	},

	getWorld: function() {
		return this._world;
	},
	
	openDebug: function(canvas) {
		this.debug = true;

		var debugDraw = new b2DebugDraw(),
			scale = this._scale;
			
		debugDraw.SetSprite(canvas._context2d);
		debugDraw.SetDrawScale(scale);
		debugDraw.SetFillAlpha(0.3);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		debugDraw.m_sprite.graphics.clear = function(){};
	
		this._world.SetDebugDraw(debugDraw);
	},
	
	drawDebug: function() {
		if (this.debug) {
			this._world.DrawDebugData();
		}
	},
	
	_initWorld: function(size, scale) {
		this._world = new b2World(new b2Vec2(0, 10), true);
		this._scale = scale;
		this._worldSize = { width: size.width / scale, height: size.height / scale };
	},
	
	_initGround: function() {
		var world = this._world;
		
		var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_staticBody;
        bodyDef.position.x = this._worldSize.width/2;
        bodyDef.position.y = this._worldSize.height;
        
		var fixDef = new b2FixtureDef();
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;
        
        fixDef.shape = new b2PolygonShape();
        fixDef.shape.SetAsBox(this._worldSize.width/2, 0);
        
        world.CreateBody(bodyDef).CreateFixture(fixDef);
	},

	_updateObjects: function() {
		var world = this._world,
			scale = this._scale,
			PI2 = Math.PI * 2,
			R2D = 180 / Math.PI;
			
		var i = 0,
			f, xf, data,
	   		b = world.m_bodyList,
	   		x, y, r, obj;
	   		
	    while (b) {
	    	f = b.m_fixtureList;
	      	while (f) {
	        	if (f.m_userData) {
	        		xf = f.m_body.m_xf;
	        		data = f.m_userData;
	          		obj = data.displayObj;
	          		
	          		x = xf.position.x * scale;
	          		y = xf.position.y * scale;
	          		r = Math.round(((f.m_body.m_sweep.a + PI2) % PI2) * R2D * 100) / 100;
	          		obj.style({ x: x, y: y, transform: { rotate: r } });
	        	}
	        	f = f.m_next;
	      	}
	      	b = b.m_next;
	    }
	}

});

return PhysicsWorld;
});