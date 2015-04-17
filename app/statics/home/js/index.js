require.config({
    baseUrl: '/build'
})

require(['cartoon'], function(ct) {
    'use strict';

    var stage_0 = new ct.Stage({
        elem: '.slides li:first-child'
    });

    var box = new ct.DisplayObject({ x: 458, y: 0 });
    var img = new ct.Bitmap({
        x: 0, y: -70, image: '/static/home/img/box.png', rect: [0,0,70,70]
    });
    box.add(img);
    
    var robot = new ct.Sprite({
        x: 930, y: 157,
        ss: {"images":["/static/home/img/robot.png"],"frames":[[0,0,66,92,0,5,4],[66,0,66,92,0,5,4],[132,0,69,93,0,3,2],[201,0,71,93,0,2,1],[272,0,71,93,0,2,0],[343,0,72,92,0,2,0],[415,0,71,93,0,2,0],[486,0,68,93,0,4,2],[554,0,66,93,0,5,3],[620,0,66,92,0,5,4],[686,0,66,92,0,5,4]],"offsetX":0,"offsetY":0,"animations":{"all":[0,10,true,660]}}
    });

    var bird = new ct.Sprite({
        x: 380, y: 60,
        ss: {"images":["/static/home/img/wing.png"],"frames":[[0,0,69,32,0,0,0],[69,0,69,31,0,0,1]],"offsetX":0,"offsetY":0,"animations":{"all":[0,1,true,240]}}
    });
    bird.play('all');

    var play = function() {
        robot.play('all');
    }

    var move = function() {
        robot.style('transform', { scaleX: 1 });
        robot.stop();
        robot.to(1000, play).to({ x: 1040 }, 2000, null, function() {
            robot.style('transform', { scaleX: -1 });
            robot.stop();
            robot.to(1000, play).to({ x: 930 }, 2000, null, move);
        });
    }

    var fly = function() {
        var posY = function(pos) {
            bird.style('y', 60 + Math.sin(pos*10)*8);
        }
        bird.style('transform', { scaleX: -1 });
        bird.to({ x: 640 }, 3500, null, function() {
            bird.style('transform', { scaleX: 1 });
            bird.to({ x: 380 }, 3500, null, fly, posY);
        }, posY)
    }

    var drop = function() {
        box.to(2000).to({ y: 253 }, 1200, 'bounceOut')
        var worm = new ct.Sprite({
            x: 14, y: -98, alpha: 0,
            ss: {"images":["/static/home/img/worm.png"],"frames":[[0,0,43,28,0,0,0],[43,0,43,26,0,0,2]],"offsetX":0,"offsetY":0,"animations":{"all":[0,1,true,240]}}
        });
        worm.play('all');
        worm.to(3200).to({ alpha: 1}, 1000);
        box.add(worm);
    }

    move();
    fly();
    drop();

    stage_0.add(box);
    stage_0.add(robot);
    stage_0.add(bird);

    // 创建容器和图形
    var canvas = new ct.Canvas({ elem: '#canvas', width: 1100, height: 200 });
    var circle = new ct.Circle({ x: 100, y: 60, radius: 40, fill: 'top,#0ff,#ff0' });
    canvas.add(circle);

    // 添加计时器
    var ticker = ct.Ticker;
    ticker.add(ct.Tween);   // 更新补间动画
    ticker.add(stage_0);
    ticker.add(canvas);     // 更新画布
    ticker.start();

    // 创建补间动画
    var animate = function() {
        circle.to({ x: 900, transform: { rotate: 720, scale: 2 } }, 2400, 'bounceIn')
              .to({ x: 100, transform: { rotate: 0, scale: 1 } }, 1200, 'easeInOut');
    };
    ticker.loop(animate, 4000);

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/html");
});