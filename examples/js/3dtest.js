
var test3d = {
	
	geometry: {
		init: function(ct, cvs, $fps) {
			var ticker = new ct.Ticker(),
				T = ct.THREE;
			
			var scene = cvs.scene,
				camera = cvs.camera,
				renderer = cvs.renderer;

			var mesh = function(g) {
				return new T.Mesh( g, new T.MeshBasicMaterial( { wireframe: true } ) );
			}

			var g = new T.PlaneGeometry( 14, 14 );
			var plane = mesh( g );
			
			g = new T.CircleGeometry( 8, 15 );
			var circle = mesh( g );
			circle.position.set( 20, 0, 0 );
			
			g = new T.RingGeometry( 5, 8, 15 );
			var ring = mesh( g );
			ring.position.set( 40, 0, 0 );
			
			g = new T.BoxGeometry( 10, 10, 10 );
			var box = mesh( g );
			box.position.set( 0, 20, 0 );
			
			g = new T.SphereGeometry( 8, 9, 9 );
			var sphere = mesh( g );
			sphere.position.set( 20, 20, 0 );
			
			g = new T.TorusGeometry( 7, 2, 12, 12 );
			var torus = mesh( g );
			torus.position.set( 40, 20, 0 );
			
			g = new T.CylinderGeometry( 5, 5, 15, 10 )
			var cylinder = mesh( g );
			cylinder.position.set( -20, 20, 0 );
			
			g = new T.TorusGeometry( 7, 2, 12, 12 );
			var torus = mesh( g );
			torus.position.set( 40, 20, 0 );
			
			g = new T.TorusKnotGeometry( 5, 1, 50, 9 );
			var knot = mesh( g );
			knot.position.set( -40, 20, 0 );
			
			var sp = new T.Shape(); 
			sp.moveTo( 0, -5 );
			sp.lineTo( 2, -8 );
			sp.lineTo( 5, 0 );
			sp.lineTo( 10, 0 ); 
			sp.lineTo( 0, 10 ); 
			sp.lineTo( -10, 0 );
			sp.lineTo( -5, 0 );
			sp.moveTo( -2, -8 );
			sp.lineTo( 0, -5 );
			g = new T.ShapeGeometry( sp );
			var shape = mesh( g );
			shape.position.set( -20, 0, 0 );
			
			var p = []; 
			for ( var i = 0; i < 10; i ++ ) {
				p.push( new T.Vector3( Math.sin( i * 0.2 ) * 8, 0, ( i - 3 ) ) ); 
			} 
			g = new T.LatheGeometry( p );
			var lathe = mesh( g );
			lathe.position.set( 20, -20, 0 );
			
			g = new T.IcosahedronGeometry( 8, 0 );
			var icosahedron = mesh( g );
			icosahedron.position.set( -40, 0, 0 );
			
			
			g = new T.OctahedronGeometry( 8, 0 );
			var octahedron = mesh( g );
			octahedron.position.set( 0, -20, 0 );
			
			var h = '';
			for(var i in T) {
				if (/Geometry/.test(i)) {
					h += ' '+i;
				}
			}

			/*
			g = new T.TextGeometry( 'ABC', {

					size: 70,
					height: 20,
					curveSegments: 4,

					font: '微软雅黑',
					weight: 'bold',
					style: 'normal',

					bevelThickness: 2,
					bevelSize: 1.5,
					bevelEnabled: true,

					material: 0,
					extrudeMaterial: 1

				});
			txt = mesh( g );
			txt.position.set( 0, -20, 0 ); 
			for ( i = 0, len = geometry.vertices.length; i < len; i ++ ) {
				geometry.vertices[ i ].y = 35 * Math.sin( i/2 );
			}*/
			scene.add( plane );
			scene.add( circle );
			scene.add( ring );
			scene.add( box );
			scene.add( sphere );
			scene.add( cylinder );
			scene.add( torus );
			scene.add( knot );
			// scene.add( convex );
			scene.add( shape );
			scene.add( lathe );
			scene.add( icosahedron );
			scene.add( octahedron );

			// scene.add( txt );
			camera.position.z = 60;

			var render = function () {
				for (var i=0, l=scene.children.length; i<l; i++) {
					scene.children[i].rotation.y += 0.01;
				}
				
				renderer.render(scene, camera);
			};
			
			camera.position.set(0, 0, 60);
			camera.lookAt(new T.Vector3(0, 0, 0));
			ticker.add(render);
            ticker.start();
			
			this.dispose = function() {
				ticker.stop();
				cvs.removeAll();
			}
		}
	},
	
	material: {
		init: function(ct, cvs, $fps) {
			var ticker = new ct.Ticker(),
				T = ct.THREE;

			var scene = cvs.scene,
				camera = cvs.camera,
				renderer = cvs.renderer;
			
			var mesh = function(m, p) {
				return new T.Mesh( new T.SphereGeometry( 8, p||16, p||16 ),  m );
			}
			
			var hemi = new T.HemisphereLight( 0xffffff, 0xffffff, 0.2 );
			hemi.position.set(0, 0, -10);
			
			var light  = new T.DirectionalLight( 0xffffff, 3 );
			light.add( new T.Mesh( new T.SphereGeometry( 1, 1, 1 ), new T.MeshBasicMaterial({ color: 0xffffff }) ) );
			
			var plane = new T.Mesh( new T.PlaneGeometry( 200, 200, 200 ), new T.MeshBasicMaterial({ color: 0x666666 }) )
			plane.position.set(0, 0, -20);
			
			var m, t, frame, basic, lambert, phong, depth, map;
			
			m = new T.MeshBasicMaterial( { wireframe: true } );
			frame = mesh( m );
			
			m = new T.MeshBasicMaterial({ color: 0xff0000 });
			basic = mesh( m );
			basic.position.set(20, 0, 0);
			
			m = new T.MeshLambertMaterial( { color: 0x00ff00 } );
			lambert = mesh( m, 80 );
			lambert.position.set(40, 0, 0);
			
			m = new T.MeshPhongMaterial({ color: 0x0000ff });
			phong = mesh( m );
			phong.position.set(-20, 0, 0);
			
			m = new T.MeshDepthMaterial();
			depth = mesh( m );
			depth.position.set(-40, 0, 0);
			
			t = new T.Texture( ct.Preload.getItem('images/flower.jpg') );
			t.needsUpdate = true;
			m = new T.MeshLambertMaterial( { map: t , transparent: true } );
			map = mesh( m );
			map.position.set(0, -20, 0);
			
			scene.add( hemi );
			scene.add( light );
			scene.add( plane );
			scene.add( frame );
			scene.add( basic );
			scene.add( lambert );
			scene.add( phong );
			scene.add( depth );
			scene.add( map );
			
			camera.position.set(0, -60, 60);
			camera.lookAt(new T.Vector3(0, 0, 0));
			
			var deg = 0, rad;
			var render = function () {
				rad = Math.PI/180*(deg++);
				light.position.set( Math.sin(rad)*60, Math.cos(rad)*60, 20 );
				renderer.render(scene, camera);
			};

			ticker.add(render);
            ticker.start();
			
			this.dispose = function() {
				ticker.stop();
				cvs.removeAll();
			}
		}
	}
	
}
