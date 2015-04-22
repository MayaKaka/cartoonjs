var pname = $.query.get('pname');

require.config({
    baseUrl: '/src',
    path: {
        'cartoon': 'cartoon',
        'cartoon.particle': 'cartoon.particle',
        'cartoon.ui': 'cartoon.ui',
        'cartoon.three': 'cartoon.three'
    }
})

require(['cartoon', 'cartoon.ui'], function(ct) {

    var viewer = new ct.Viewer();
    var ticker = ct.Ticker;
    var tween = ct.Tween;
    var stage;
    var div
    var style;

    var init = function(data) {
        viewer.enableScript(true);
        viewer.useCss('opr-'+pname+'-');
        style = document.createElement('style');
        style.type = 'text/css';
        if(style.styleSheet){
            style.styleSheet.cssText = data.css;
        }else{
            style.appendChild(document.createTextNode(data.css));
        }
        stage = viewer.parse(data.scenes.stage);
        ticker.add(tween);
        ticker.add(stage);
        ticker.start();
        document.body.appendChild(style);
        document.body.appendChild(stage.elem);
    }

    $.ajax({
        url: '/editor/load-project',
        data: {
            pname: pname
        },
        success: init
    });

});