
var test3d = {
	
	geometry: {
		init: function(ct, cvs, $fps) {
			var ticker = new ct.Ticker(),
				T = ct.THREE;

			var scene = new T.Scene();
			var camera = new T.PerspectiveCamera( 75, cvs.width/cvs.height, 1, 10000 );
			
			var renderer = new T.WebGLRenderer({ canvas: cvs.elem });
			renderer.setSize( cvs.width, cvs.height );
	
			var geometry, material, 
				cube, sphere;
			
			geometry = new T.BoxGeometry( 10, 10, 10 );
			material = new T.MeshBasicMaterial( {color: 0x00ff00} );
			cube = new T.Mesh( geometry, material );
			scene.add( cube );
			
			geometry = new T.SphereGeometry( 10, 32, 32 );
			material = new T.MeshBasicMaterial( {color: 0xffff00} );
			sphere = new T.Mesh( geometry, material );
			sphere.position.set( 20, 0, 0 );
			scene.add( sphere );
			
			camera.position.z = 50;

			var render = function () {

				cube.rotation.x += 0.1;
				cube.rotation.y += 0.1;

				renderer.render(scene, camera);
			};

			ticker.add(render);
            ticker.start();
			
			this.dispose = function() {
				ticker.stop();
			}
		}
	}
}
