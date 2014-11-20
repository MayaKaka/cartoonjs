
define( function ( require, exports, module ) {
	"use strict";

var THREE = require('webgl/THREE'),
	OriginObject3D = THREE.Object3D;

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

p.each = function() {

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

Object3D.geometries = {
	plane: {
		init: function(data) {
			return new THREE.PlaneGeometry(data);
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
	
	box: {
		init: function(data) {
			return new THREE.BoxGeometry(data);
		}
	},
	
}

Object3D.meterials = {
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


return Object3D;
});