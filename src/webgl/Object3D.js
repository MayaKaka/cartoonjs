
define( function ( require, exports, module ) {
	"use strict";

var THREE = require('webgl/THREE'),
	Tween = require('animation/Tween'),
	OriginObject3D = THREE.Object3D,
	JSONLoader = THREE.JSONLoader;

var Object3D = OriginObject3D,
	p = Object3D.prototype;
	
p.renderMode = 2; // 渲染模式 WebGL

p.on = function() {
	
}

p.off = function() {
	
}

p.trigger = function() {
	
}

p.removeAll = function() {

}

p.each = function(fn) {
	var children = this.children;

	for (var i=0, l=children.length; i<l; i++) {
		fn(children[i], i);
	}
}

p.style = function() {
	
}

p.data = function() {
	
}

p.to = function() {
	
}

Object3D.create = function(props) {
	var g = props.geometry || props.g || {},
		m = props.material || props.m || {};
	
	var geometry = this.geometries[g.type || 'plane'],
		material = this.materials[m.type || 'basic'];
	
	geometry = geometry.init(g);
	material = material.init(m);
	
	g.fn && g.fn(geometry);
	m.fn && m.fn(material);

	return new THREE.Mesh( geometry, material );
}

Object3D.createLight = function(props) {
	var l = props || {};
	
	var light = this.lights[l.type || 'point'];
	
	l.color = l.color || 0xffffff;
	l.intensity = l.intensity || 1;
	
	light = light.init(l);
	if (l.debug) {
		light.add(this.create({
			g: { type: 'box', size: [ 1, 1, 1] }, m: { type: 'basic', color: l.color }
		}))
	}
	l.fn && l.fn(light);

	return light;
}

Object3D.createModel = function(data) {
	var result = new THREE.JSONLoader().parse(data.json),
		geometry = result.geometry,
		material = result.material;
	
	material = new THREE.MeshFaceMaterial(material);
	
	var model = new THREE.SkinnedMesh( geometry, material );
	data.fn && data.fn(model)
	
	return model;
}

Object3D.geometries = {
	plane: {
		init: function(data) {
			return new THREE.PlaneGeometry(data.width || 100, data.height || 100);
		}
	},
	
	circle: {
		init: function(data) {
			return new THREE.CircleGeometry(data);
		}
	},
	
	ring: {
		init: function(data) {
			return new THREE.RingGeometry(data);
		}
	},
	
	sphere: {
		init: function(data) {
			return new THREE.SphereGeometry(data.radius || 3, data.segment || 9, data.segment || 9);
		}
	},
	
	box: {
		init: function(data) {
			var size = data.size || [ 5, 5, 5 ];
			return new THREE.BoxGeometry(size[0], size[1], size[2]);
		}
	}
}

Object3D.materials = {
	basic: {
		init: function(data) {
			return new THREE.MeshBasicMaterial(data);		
		}
	},
	lambert: {
		init: function(data) {
			return new THREE.MeshLambertMaterial(data);
		}
	},
	phong: {
		init: function(data) {
			return new THREE.MeshPhongMaterial(data);
		}
	}
}

Object3D.lights = {
	point: {
		init: function(data) {
			return new THREE.PointLight(data.color, data.intensity, data.distance || (data.intensity*10));		
		}
	},
	area: {
		init: function(data) {
			return new THREE.AreaLight(data.color, data.intensity);
		}
	},
	spot: {
		init: function(data) {

			return new THREE.SpotLight(data.color);
		}
	},
	direct: {
		init: function(data) {

			return new THREE.DirectionalLight(data.color, data.intensity);
		}
	},
	ambient: {
		init: function(data) {
			return new THREE.AmbientLight(data.color);
		}
	}, 
	hemisphere: {
		init: function(data) {
			return new THREE.HemisphereLight(data.color, data.groundColor || 0x888888, data.intensity);
		}
	}
}

return Object3D;
});