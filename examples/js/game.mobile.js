require(['cartoon'], function(ct) {
	// alert(window.innerWidth, window.innerHeight);
	var canvas = ct.create({
		type: 'Canvas', elem: '#canvas', 
		x: 0, y: 0, width: window.innerWidth, height: window.innerHeight
	});

	var stage = ct.create({
		type: 'Container', elem: '#stage', 
		x: 0, y: 0
	});

	var fps = ct.create({
		type: 'Text', elem: '#fps', 
		x: 0, y: 0, width: 100, 
		text: 'fps: 0', color: '#ffffff', size: 20
	});
	fps.enable(false);

	var ticker = new ct.Ticker();
	ticker.add(ct.Tween);
	ticker.add(canvas);
	ticker.add(stage);
	ticker.add(function() { 
		fps.value('fps: ' + ticker.fps);
	});
	ticker.start();




	var r1 = new ct.Shape({
		x: 40, y: 100, g: { type: 'rect', width: 140, height: 330, fill: '#ffffff' }
	});
	stage.add(r1);

	var r2 = new ct.Shape({ renderMode: 'canvas',
		x: 190, y: 100, g: { type: 'rect', width: 140, height: 330, fill: '#ffffff' }
	});
	canvas.add(r2);

	var c1 = new ct.Shape({
		x: 60, y: 85, g: { type: 'circle', radius: 30, fill: 'blue' }, transform: { translateX: 20, translateY: 20 }
	});
	stage.add(c1);

	var c2 = new ct.Shape({ renderMode: 'canvas',
		x: 210, y: 85, g: { type: 'circle', radius: 30, fill: 'blue' }, transform: { translateX: 20, translateY: 20 }
	});
	canvas.add(c2);

	var b1 = new ct.Bitmap({
		x: 50, y: 170, width: 120, height: 140, image: 'images/home.jpg', scaleToFit: true
	});
	stage.add(b1);

	var b2 = new ct.Bitmap({ renderMode: 'canvas',
		x: 200, y: 170, width: 120, height: 140, image: 'images/home.jpg', scaleToFit: true
	});
	canvas.add(b2);
	
	var b1 = new ct.Bitmap({
		x: 40, y: 290, width: 140, height: 140, image: 'images/sprite/girl.png'
	});
	stage.add(b1);

	var b2 = new ct.Bitmap({ renderMode: 'canvas',
		x: 190, y: 290, width: 140, height: 140, image: 'images/sprite/girl.png'
	});
	canvas.add(b2);

	var t1 = new ct.Text({
		x: 30, y: 430, width: 150, text: 'render by dom', color: '#ffffff', size: 20, shadow: '1px 1px 1px red'
	});
	stage.add(t1);

	var t2 = new ct.Text({ renderMode: 'canvas',
		x: 200, y: 430, width: 150, text: 'render by canvas', color: '#ffffff', size: 20, shadow: '1px 1px 1px red'
	});
	canvas.add(t2);

	var s1 = new ct.Shape({
		x: 80, y: 0, g: { type: 'circle', radius: 32, fill: 'images/oneDot.png' }
	});
	s1.on('click', function() {
		s1.to({ y: 400, transform: { rotate: 360 } }).to({ y: 0, transform: { rotate: 0 } });
	});
	stage.add(s1);

	var s2 = new ct.Shape({ renderMode: 'canvas',
		x: 230, y: 0, g: { type: 'polyStar', radius: 32, fill: 'images/oneDot.png' }
	});
	s2.on('click', function() {
		s2.to({ y: 400, transform: { rotate: 360 } }).to({ y: 0, transform: { rotate: 0 } });
	});
	canvas.add(s2);

});