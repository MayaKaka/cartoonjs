
define( function ( require, exports, module ) {
	"use strict";

var THREE = require('webgl/THREE');

var Object3DFactory = function() {};

var createMesh = function(props) {
	
	var geometry = props.geometry || {}, 
		materia = props.material || {},
		mesh = props.mesh || {};
	
	var GeometryClass, MaterialClass, MeshClass;
	
	switch (geometry.type) {
		case 'plane':
			GeometryClass = THREE.PlaneGeometry;
			break;
		case 'cube':
			GeometryClass = THREE.CubeGeometry;
			break;
		case 'Sphere':
			GeometryClass = THREE.SphereGeometry;
			break;
		case 'Ring':
			GeometryClass = THREE.RingGeometry;
			break;
		default:
			GeometryClass = THREE.BoxGeometry;
			break;
	}
	

	switch (materia.type) {
		case 'lambert':
			MaterialClass = THREE.MeshLambertMaterial;
			break;
		case 'phong':
			MaterialClass = THREE.MeshPhongMaterial;
			break;
		case 'basic':
			MaterialClass = THREE.MeshBasicMaterial;
			break;
		case 'face':
			MaterialClass = THREE.MeshFaceMaterial;
			break;
		default:
			MaterialClass = THREE.MeshNormalMaterial;
			break;
	}
	
	switch (mesh.type) {
		case '':
			break;
	}
}

Object3DFactory.create = function(data) {
	
}

Object3DFactory.objects = {
	light: function(data) {
		
	},
	plane: function(data) {
		
	},
	cube: function(data) {
		
	},
	sprite: function(data) {
		
	},
	model: function(data) {
		
	}
};

return Object3DFactory;
});