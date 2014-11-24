
define( function ( require, exports, module ) {
	"use strict";

var THREE = require('webgl/THREE'),
	Preload = require('core/Preload'),
	Tween = require('animation/Tween'),
	OriginObject3D = THREE.Object3D,
	JSONLoader = THREE.JSONLoader;

var Object3D = OriginObject3D,
	p = Object3D.prototype;

var blendings = [ "NoBlending", "NormalBlending", "AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "AdditiveAlphaBlending" ];
	
p.renderMode = 2; // 渲染模式 WebGL

p.on = p.addEventListener;

p.off = p.removeEventListener;

p.trigger = p.dispatchEvent;

p.removeAll = function() {

}

p.each = function(fn) {
	var children = this.children;

	for (var i = 0, len = children.length; i < len; i++) {
		fn(children[i], i);
	}
}

p.style = function() {
		
}

p.data = function() {
	
}

p.to = function() {
	
}

Object3D.create = function(data) {
	var geo = data.geometry || data.g || {},
		mat = data.material || data.m || {};
	
	var geometry = this.geometries[geo.type || 'plane'],
		material = this.materials[mat.type || 'basic'],
		mesh;

	if (typeof(mat.map) === 'string') {
		mat.map = new THREE.Texture(Preload.getItem(mat.map));
		mat.map.needsUpdate = true;
	}
	
	geometry = geometry.init(geo);
	material = material.init(mat);
	
	data.pre && data.pre(geometry, material);
	mesh = new THREE.Mesh(geometry, material); 
	data.fn && data.fn(mesh);
	
	return mesh;
}

Object3D.createLight = function(data) {
	data = data || {};
	
	var light = this.lights[data.type || 'point'];
	
	data.color = data.color || 0xffffff;
	data.intensity = data.intensity || 1;
	
	light = light.init(data);
	if (data.debug) {
		light.add(this.create({
			g: { type: 'box', size: [ 1, 1, 1 ] }, m: { type: 'basic', color: data.color }
		}))
	}
	data.fn && data.fn(light);

	return light;
}

Object3D.createModel = function(data) {
	var loader = new THREE.JSONLoader(),
		url = data.json,
		json = JSON.parse(Preload.getItem(url)),
		mesh;
	
	var result = loader.parse(json, loader.extractUrlBase(url)),
		geometry = result.geometry,
		materials = result.materials,
		animation = geometry.animation,
		hierarchy = animation ? animation.hierarchy : null,
		morph = geometry.morphTargets.length, 
		Mesh = ((!animation || !hierarchy) && morph) ? THREE.MorphAnimMesh : THREE.SkinnedMesh;
		
	geometry.computeBoundingBox();
	if (morph) {
		var material = materials[0];
		material.morphTargets = true;
		// material.shading = THREE.NoShading;
	}
	data.pre && data.pre(geometry, materials);
	mesh = new Mesh(geometry, new THREE.MeshFaceMaterial(materials));	
	
	if (Mesh === THREE.MorphAnimMesh) {	
		mesh.setFrameRange(0, morph);
		mesh.duration = morph * 24 / 1000;
	} else if (animation) {
		mesh.updateAnimation = function() {
			
		}
	}
	data.fn && data.fn(mesh);

	return mesh;
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
	
	box: {
		init: function(data) {
			var size = data.size || [ 5, 5, 5 ];
			return new THREE.BoxGeometry(size[0], size[1], size[2]);
		}
	},
	
	sphere: {
		init: function(data) {
			return new THREE.SphereGeometry(data.radius || 3, data.segment || 9, data.segment || 9);
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
	},
	face: {
		init: function(data) {
			return new THREE.MeshFaceMaterial(data);
		}
	},
	shader: {
		init: function(data) {
			return new THREE.ShaderMaterial(data);
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