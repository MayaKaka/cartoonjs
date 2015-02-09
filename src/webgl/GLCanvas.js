
define(function (require) {
	"use strict";
	   
var cartoon = require('cartoon'),
	THREE = require('webgl/THREE'),
	DisplayObject = cartoon.DisplayObject;

var GLCanvas = DisplayObject.extend({
	
	type: 'GLCanvas',
		
	renderMode: 0,
	useElemSize: true,
	
	renderer: null,
	scene: null,
	camera: null,
	
	_tagName: 'canvas',

	init: function(props) {
		this._super(props);
		this._initScene(props.render);
	},
	
	clear: function() {
		
	},
	
	update: function(delta) {
		var renderer = this.renderer,
			scene = this.scene,
			camera = this.camera;

		renderer.render( scene, camera );
	},
	
	add: function(child) {
		this.scene.add(child);
		return this;
	},
	
	remove: function(child) {
		this.scene.remove(child);
	},
	
	removeAll: function(){
		var scene = this.scene,
			children = scene.children,
			index, child;
		// 遍历移除子节点
		while (children.length) {
			index = children.length - 1;
			child = children[index];
			scene.remove(child);
		}
	},
	
	
	createModel: function(data, callback) {
		var loader = new THREE.JSONLoader();
		var loadComplete;
		if (!data.type) {
			loadComplete = function ( geometry, materials ) {
				
				var material // = new THREE.MeshLambertMaterial( { color: data.color || 0xffdd88 } );
						  	 = new THREE.MeshFaceMaterial( materials );

				var mesh = new THREE.SkinnedMesh( geometry, material );
				
				callback(mesh);
			};
		} else if (data.type === 'morphAnim') {
			loadComplete = function ( geometry, materials ) {
				var material = materials[0]; 
			    material.morphTargets = true; 
			    material.shading = THREE.NoShading; 
			 
			    var mesh = new THREE.MorphAnimMesh(geometry, new THREE.MeshFaceMaterial(materials)); 
			     
			    mesh.setFrameRange(0, 290); //设置起始帧和结束帧 
			    mesh.duration = 290 * 24 / 1000; //设置动画播放时长 
				
				callback(mesh);
				// 播放动画
				var animation = new THREE.MorphAnimation( mesh );
				animation.play();
			};
		} else if (data.type === 'skinned') {
			loadComplete = function ( geometry, materials ) {
				var x = 0, y = 0, z = 0, s = 15;
				// 初始化模型动画
				var animation = geometry.animation;
				for ( var i = 0; i < animation.hierarchy.length; i ++ ) {
					var bone = animation.hierarchy[ i ];
		
					var first = bone.keys[ 0 ];
					var last = bone.keys[ bone.keys.length - 1 ];
		
					last.pos = first.pos;
					last.rot = first.rot;
					last.scl = first.scl;
				}

				// 初始化模型材质	
				geometry.computeBoundingBox();
				var bb = geometry.boundingBox;
	
				for ( var i = 0; i < materials.length; i ++ ) {
					var m = materials[ i ];
					m.skinning = true;
					m.morphTargets = true;
	
					m.specular.setHSL( 0, 0, 0.1 );
					m.color.setHSL( 0.6, 0, 0.6 );
					m.ambient.copy( m.color );
					m.wrapAround = true;
				}
				// 创建模型对象
				var mesh = new THREE.SkinnedMesh( geometry, new THREE.MeshFaceMaterial( materials ) );
				mesh.position.set( x, y - bb.min.y * s, z );
				mesh.scale.set( s, s, s );
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				// 处理模型对象
				callback( mesh );
				// 播放动画
				var animation = new THREE.Animation( mesh, geometry.animation );
				animation.play();
			};
		}
		loader.load(data.url, loadComplete); 
	},
	
	_initScene: function(data) {
		data = data || {};
		data.canvas = this.elem;
		data.antialias = true;
		
		var renderer = this.renderer = new THREE.WebGLRenderer(data);		
		renderer.setSize(this.width, this.height);
		
		var scene = this.scene = new THREE.Scene();
		
		var	camera = this.camera  = new THREE.PerspectiveCamera( 70, this.width/this.height, 1, 10000 );
	}

});

return GLCanvas;
});