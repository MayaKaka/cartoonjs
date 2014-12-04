
var test3d = {
	transform: {
		init: function(ct, cvs, $fps) {
			var ticker = new ct.Ticker(),
				O3D = ct.Object3D,
				T = ct.THREE;
			
			var scene = cvs.scene,
				camera = cvs.camera,
				renderer = cvs.renderer;

			renderer.sortObjects = false;	
			scene.add( new T.GridHelper( 500, 100 ) );
			camera.position.set( 1000, 500, 1000 );
			camera.lookAt( new T.Vector3( 0, 200, 0 ) );

			var light = new T.DirectionalLight( 0xffffff, 2 );
			light.position.set( 1, 1, 1 );
			scene.add( light );

			var geometry = new T.BoxGeometry( 200, 200, 200 );
			var material = new T.MeshLambertMaterial( { wireframe: true } );

			var	control = new ct.TransformControls( camera, renderer.domElement );
			control.addEventListener( 'change', function() {
				control.update();
			});

			var mesh = new T.Mesh( geometry, material );
			scene.add( mesh );

			control.attach( mesh );
			scene.add( control );

			window.addEventListener( 'keydown', function ( event ) {
		            //console.log(event.which);
		            switch ( event.keyCode ) {
		              case 81: // Q
		                control.setSpace( control.space == "local" ? "world" : "local" );
		                break;
		              case 87: // W
		                control.setMode( "translate" );
		                break;
		              case 69: // E
		                control.setMode( "rotate" );
		                break;
		              case 82: // R
		                control.setMode( "scale" );
		                break;
					case 187:
					case 107: // +,=,num+
						control.setSize( control.size + 0.1 );
						break;
					case 189:
					case 10: // -,_,num-
						control.setSize( Math.max(control.size - 0.1, 0.1 ) );
						break;
		            }
        	});

			ticker.start();

			this.dispose = function() {
				ticker.stop();
				cvs.removeAll();
			}
		}
	},

	geometry: {
		init: function(ct, cvs, $fps) {
			var ticker = new ct.Ticker(),
				O3D = ct.Object3D,
				T = ct.THREE;
			
			var scene = cvs.scene,
				camera = cvs.camera,
				renderer = cvs.renderer;

			var mesh = function(g) {
				return new T.Mesh( g, new T.MeshBasicMaterial( { wireframe: true } ) );
			}

			var g = new T.PlaneGeometry( 14, 14 );
			var plane =	O3D.create({
					g: { type: 'plane', width: 14, height: 14 },
					m: { type: 'basic', wireframe: true }
				});

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
				$fps.html(ticker.fps);
			};
			
			$fps.css('color', '#FFF');
			camera.position.set(0, 0, 60);
			camera.lookAt(new T.Vector3(0, 0, 0));
			ticker.add(render);
            ticker.start();
			
			this.dispose = function() {
				ticker.stop();
				cvs.removeAll();
				$fps.css('color', '');
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
				$fps.html(ticker.fps);
			};
			
			$fps.css('color', '#FFF');
			ticker.add(render);
            ticker.start();
			
			this.dispose = function() {
				ticker.stop();
				cvs.removeAll();
				$fps.css('color', '');
			}
		}
	},
	
	light: {
		init: function(ct, cvs, $fps) {
			var ticker = new ct.Ticker(),
				RAD_P_DEG = Math.PI/180,
				O3D = ct.Object3D,
				T = ct.THREE;
				
			var camera = cvs.camera;
			
			var plane = O3D.create({
				g: { type: 'plane', width: 100, height: 100 },
				m: { type: 'phong', color: 0xffffff, specular: 0x888888, shininess: 200 }
			});
			var box = O3D.create({
				g: { type: 'sphere', radius: 10, segment: 30 },
				m: { type: 'lambert', color: 0xff0000 }
			});
			box.position.set(0, 0, 20);
			var obj = new O3D();
			
			var point = O3D.createLight({
				type: 'point', color: 0xff0000, debug: true, distance:40
			});
			point.position.set(20, 0, 0);
			
			var hemi = O3D.createLight({
				type: 'hemisphere', color: 0x00ff00, debug: true, groundColor:0x222222
			});
			hemi.position.set(-100, -100, -100);
			
			// var area = O3D.createLight({
				// type: 'area', color: 0x0000ff, debug: true, intensity: 1
			// });
			function createAreaEmitter( light ) {
				var geometry = new T.BoxGeometry( 1, 1, 1 );
				var material = new T.MeshBasicMaterial( { color: light.color.getHex(), vertexColors: T.FaceColors } );

				var backColor = 0x222222;

				geometry.faces[ 5 ].color.setHex( backColor );
				geometry.faces[ 4 ].color.setHex( backColor );
				geometry.faces[ 2 ].color.setHex( backColor );
				geometry.faces[ 1 ].color.setHex( backColor );
				geometry.faces[ 0 ].color.setHex( backColor );

				var emitter = new T.Mesh( geometry, material );
				emitter.scale.set( light.width * 2, 0.2, light.height * 2 );

				light.add( emitter );
			}
			var area = new T.AreaLight( 0x0000ff, 10 );
			area.width = 20; area.height = 2;
			createAreaEmitter( area );
			area.rotation.set(0.2, 0, 0);
			area.position.set(0, -30, 2);
			
			var direct = O3D.createLight({
				type: 'direct', color: 0xffff00, debug: true
			});
			
			var spot = O3D.createLight({
				type: 'spot', color: 0xff00ff, debug: true
			});
			spot.position.set(80, 80, 30);
			
			var ambient = O3D.createLight({
				type: 'ambient', color: 0xffffff, debug: true
			});
			ambient.position.set(0, 20, 20);
			
			obj.add(point);
			obj.add(area);
			obj.add(direct);
			obj.add(spot);
			obj.add(hemi);
			
			/* obj.add(ambient); */
			
			cvs.add(plane);
			cvs.add(box);
			cvs.add(obj);
			
			camera.position.set(0, -60, 60);
			camera.lookAt(new T.Vector3(0, 0, 0));
			var deg = 0, c, y;
			ticker.add(function() { 
				deg++;
				point.position.set(Math.sin(deg*RAD_P_DEG)*25, Math.cos(deg*RAD_P_DEG)*25, 20);
				// direct.position.set(Math.sin(deg*RAD_P_DEG)*30, Math.cos(deg*RAD_P_DEG)*30, 20);
				// direct.lookAt(new T.Vector3(0, 0, 0));
				direct.position.set(Math.sin(deg*RAD_P_DEG/3)*80, -20, Math.cos(deg*RAD_P_DEG/3)*20);
				spot.position.set(Math.cos(deg*RAD_P_DEG/4)*25, Math.sin(deg*RAD_P_DEG/4)*25, 20);
				// hemi.position.set(-100, -100, -Math.cos(deg*RAD_P_DEG/10)*100);
				$fps.html(ticker.fps);
			});
			$fps.css('color', '#FFF');
			ticker.add(cvs);
			ticker.start();

			this.dispose = function() {
				ticker.stop();
				cvs.removeAll();
				$fps.css('color', '');
			}
		}
	},
	
	model: {
		init: function(ct, cvs, $fps) {
			var ticker = new ct.Ticker(),
				RAD_P_DEG = Math.PI/180,
				O3D = ct.Object3D,
				T = ct.THREE;
				
			var renderer = cvs.renderer,
				scene = cvs.scene,
				camera = cvs.camera;
			
			var plane = O3D.create({
				g: { type: 'plane', width: 4000, height: 4000 },
				m: { type: 'lambert', map: 'images/grasslight_big.jpg' }
			});
			plane.rotation.set(-90*RAD_P_DEG, 0, 0);
			plane.material.map.repeat.set( 8, 8 );
			plane.material.map.wrapS = plane.material.map.wrapT = T.RepeatWrapping;
			plane.receiveShadow = true;
			
			var hemi = O3D.createLight({
				type: 'hemisphere', color: 0xffffdd, debug: true, groundColor:0x222222
			});
			
			var ground = O3D.createModel({
				json: 'json/ground.js'
			});
			var g = ground.geometry;
			ground.position.set(0, -g.boundingBox.min.y*12, 0);
			ground.scale.set(24, 24, 24);
			ground.castShadow = true;
			ground.receiveShadow = true;
			
			var human = O3D.createModel({
				json: 'json/gastonLagaffe.js',
				pre: function(geometry, materials) {
					console.log(geometry, materials);
				}
			});
			human.position.set(0, -g.boundingBox.min.y*12, 0);
			human.scale.set(8, 8, 8);
			human.castShadow = true;
			human.receiveShadow = true;
			
			var point = O3D.createLight({
				type: 'point', color: 0xffffdd, debug: true, distance: 100, intensity: 10
			});
			
			cvs.add(plane);
			cvs.add(hemi);
			scene.add(human);
			scene.add(ground);
			scene.add(point);
			
			renderer.setClearColor(0xaaaaee);
			scene.fog = new T.Fog(0xaaaaee, 600);
			var deg = 0;
			ticker.add(function() {
				deg+=1;
				camera.position.set(Math.cos(deg*RAD_P_DEG/4)*220, 100, Math.sin(deg*RAD_P_DEG/4)*220);
				point.position.set(Math.sin(deg*RAD_P_DEG)*30, 120, Math.cos(deg*RAD_P_DEG)*30);
				camera.lookAt(new T.Vector3(0, 0, 0));	
				$fps.html(ticker.fps);
			});
			ticker.add(cvs);
			ticker.start();

			this.dispose = function() {
				ticker.stop();
				renderer.setClearColor(0x000000);
				scene.fog = null;
				cvs.removeAll();
			}
		}
	},
	
	animation: {
		init: function(ct, cvs, $fps) {
			var ticker = new ct.Ticker(),
				RAD_P_DEG = Math.PI/180,
				O3D = ct.Object3D,
				T = ct.THREE;
				
			var renderer = cvs.renderer,
				scene = cvs.scene,
				camera = cvs.camera;
			
			var plane = O3D.create({
				g: { type: 'plane', width: 4000, height: 4000 },
				m: { type: 'lambert', map: 'images/grasslight_big.jpg' }
			});
			plane.rotation.set(-90*RAD_P_DEG, 0, 0);
			plane.material.map.repeat.set( 8, 8 );
			plane.material.map.wrapS = plane.material.map.wrapT = T.RepeatWrapping;
			plane.receiveShadow = true;
			
			var hemi = O3D.createLight({
				type: 'hemisphere', color: 0xffffdd, debug: true, groundColor:0x222222
			});

			var human = O3D.createModel({
				json: 'json/knight.js',
				pre: function(geometry, materials) {
					console.log(geometry, materials);
				}
			});
			var g = human.geometry;
			human.position.set(0, -g.boundingBox.min.y*8, 100);
			human.scale.set(8, 8, 8);
			human.castShadow = true;
			human.receiveShadow = true;
			
			var bear = O3D.createModel({
				json: 'json/bear.js',
				pre: function(geometry, materials) {
					console.log(geometry, materials);
				}
			});
			var g = human.geometry;
			bear.position.set(0, -g.boundingBox.min.y*16, 0);
			bear.scale.set(16, 16, 16);
			bear.castShadow = true;
			bear.receiveShadow = true;
			
			var point = O3D.createLight({
				type: 'point', color: 0xffffdd, debug: true, distance: 100, intensity: 10
			});
			
			cvs.add(plane);
			cvs.add(hemi);
			cvs.add(human);
			cvs.add(point);
			cvs.add(bear);
			
			renderer.setClearColor(0xaaaaee);
			scene.fog = new T.Fog(0xaaaaee, 600);
			var deg = 0;
			ticker.add(function(delta) {
				deg+=1;
				camera.position.set(Math.cos(deg*RAD_P_DEG/4)*220, 100, Math.sin(deg*RAD_P_DEG/4)*220);
				point.position.set(Math.sin(deg*RAD_P_DEG)*60, 120, Math.cos(deg*RAD_P_DEG)*60);
				camera.lookAt(new T.Vector3(0, 0, 0));	
				human.updateAnimation(delta/1000);
				bear.updateAnimation(delta/1000);
				$fps.html(ticker.fps);
			});
			ticker.add(cvs);
			ticker.start();

			this.dispose = function() {
				ticker.stop();
				renderer.setClearColor(0x000000);
				scene.fog = null;
				cvs.removeAll();
			}
		}
	},
	
	particle: {
		init:function(ct, cvs, $fps) {
			var ticker = new ct.Ticker(),
				O3D = ct.Object3D,
				T = ct.THREE;
				
			var renderer = cvs.renderer,
				scene = cvs.scene,
				camera = cvs.camera;

			scene.fog = new T.FogExp2( 0x000000, 0.0008 );

			var geometry = new T.Geometry(),
				materials = [];

			var sprite1 = T.ImageUtils.loadTexture( "images/snow/snowflake1.png" ),
				sprite2 = T.ImageUtils.loadTexture( "images/snow/snowflake2.png" ),
				sprite3 = T.ImageUtils.loadTexture( "images/snow/snowflake3.png" ),
				sprite4 = T.ImageUtils.loadTexture( "images/snow/snowflake4.png" ),
				sprite5 = T.ImageUtils.loadTexture( "images/snow/snowflake5.png" );

			for ( i = 0; i < 10000; i ++ ) {

				var vertex = new T.Vector3();
				vertex.x = Math.random() * 2000 - 1000;
				vertex.y = Math.random() * 2000 - 1000;
				vertex.z = Math.random() * 2000 - 1000;

				geometry.vertices.push( vertex );

			}

			parameters = [ [ [1.0, 0.2, 0.5], sprite2, 20 ],
							[ [0.95, 0.1, 0.5], sprite3, 15 ],
							[ [0.90, 0.05, 0.5], sprite1, 10 ],
							[ [0.85, 0, 0.5], sprite5, 8 ],
							[ [0.80, 0, 0.5], sprite4, 5 ],
						];

			for ( i = 0; i < parameters.length; i ++ ) {

				color  = parameters[i][0];
				sprite = parameters[i][1];
				size   = parameters[i][2];

				materials[i] = new T.PointCloudMaterial( { size: size, map: sprite, blending: T.AdditiveBlending, depthTest: false, transparent : true } );
				materials[i].color.setHSL( color[0], color[1], color[2] );

				particles = new T.PointCloud( geometry, materials[i] );

				particles.rotation.x = Math.random() * 6;
				particles.rotation.y = Math.random() * 6;
				particles.rotation.z = Math.random() * 6;

				scene.add( particles );

			}
			var mouseX = 0,
				mouseY = 0;
			ticker.add(function() {
				var time = Date.now() * 0.00005;

				camera.position.x += ( mouseX - camera.position.x ) * 0.05;
				camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

				camera.lookAt( scene.position );

				for ( i = 0; i < scene.children.length; i ++ ) {

					var object = scene.children[ i ];

					if ( object instanceof T.PointCloud ) {

						object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );

					}

				}

				for ( i = 0; i < materials.length; i ++ ) {

					color = parameters[i][0];

					h = ( 360 * ( color[0] + time ) % 360 ) / 360;
					materials[i].color.setHSL( h, color[1], color[2] );

				}

			})
			ticker.start();

			this.dispose = function() {
				ticker.stop();
				cvs.removeAll();
			}
		}
	},

	poker: {
		init: function(ct, cvs, $fps) {
			var ticker = new ct.Ticker(),
				RAD_P_DEG = Math.PI/180,
				O3D = ct.Object3D,
				T = ct.THREE;
				
			var renderer = cvs.renderer,
				scene = cvs.scene,
				camera = cvs.camera;
			
			var layer = new O3D(), poker, x, y, z;
			for (var i=0; i<54; i++) {
				poker = O3D.create({
					g: { type: 'plane', width: 105, height: 150 },
					m: { type: 'basic', map: 'images/poker/'+1+'.jpg', side: T.DoubleSide }
				});
				poker.style({ x: -600, y: -300});
				x = (24-i)%6;
				x = x - 6/2;
				y = Math.floor((24-i)/6);
				y = y - 4/2;
				layer.add(poker);
			}
			var look = function() {
				camera.lookAt(new T.Vector3(0, 0, 0));
			}
			var deg = 0;
			var around = function() {
				ticker.add(function(delta) {
					deg++;
					layer.rotation.y = deg/2*Math.PI/180;
					// camera.position.set(Math.cos(deg*RAD_P_DEG/4)*220, 100, Math.sin(deg*RAD_P_DEG/4)*220);
				}, 'around');
			}
			layer.to(100, function() {
				camera.to({ y: 600 }, 6000, null, around, look);
				layer.each(function(a, i) {
					var l = layer.children.length,
						rad = i/24*Math.PI*2,
						dis = 500;

					var phi = Math.acos( -1 + ( 2 * i ) / l ),
						theta = Math.sqrt( l * Math.PI ) * phi;

					var x = dis * Math.cos( theta ) * Math.sin( phi ),
						y = dis * Math.sin( theta ) * Math.sin( phi ),
						z = dis * Math.cos( phi );


					a.to(200*i).to({ x: x, y: y, z: z }, 
						ct.random(500, 1000), null, null,
						function() {
							a.lookAt(new T.Vector3(0, 0, 0));
						}
					)	
				})
			}).to(15000, function() {
				// ticker.remove('around');
				layer.each(function(a, i) {
					var l = layer.children.length,
						rad = i/24*Math.PI*2,
						dis = 500;

					var x = dis * Math.sin( rad ),
						y = dis * i / 50,
						z = dis * Math.cos( rad );

					a.to(ct.random(0, 2400)).to({ x: x, y: y, z: z }, 
						ct.random(500, 1000), null, null,
						function() {
							a.lookAt(new T.Vector3(0, y, 0));
						}
					)	
				})
			});

			camera.position.set(0, 0, 900);
			look();
			cvs.add(layer);
			ticker.add(function(delta) {
				$fps.html(ticker.fps);
			});
			ticker.add(ct.Tween);
			ticker.add(cvs);
			ticker.start();
			
			this.dispose = function() {
				ticker.stop();
				cvs.removeAll();
			}
		}
	}
}
