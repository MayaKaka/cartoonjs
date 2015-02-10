var destroy;

function uploadDrag(evt) {
    evt.preventDefault();
}

function uploadDrop(evt) {
    evt.preventDefault();

    destroy && destroy();

    var fileList = evt.dataTransfer.files;
    if (fileList.length === 0) { 
        return; 
    }

    var xhr = new XMLHttpRequest();
    xhr.open("post", "/sprite/upload", true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === xhr.DONE) {
            if (xhr.status === 200 || xhr.status === 0) {
                text = xhr.responseText;
                console.log(text);
                require.config({
                    paths: { cartoon: '/build/cartoon' }
                })
                require(['cartoon'], function(ct) {
                    var stage = new ct.Stage({
                        elem: '.download', width: 800, height: 500
                    });
                    var sprite = new ct.Sprite({
                        ss: JSON.parse(text)
                    });
                    sprite.play('all');
                    stage.add(sprite);

                    var ticker = new ct.Ticker();
                    ticker.add(stage);
                    ticker.start();

                    destroy = function() {
                        ticker.stop();
                        stage.removeAll();
                    }
                })
            }
        }
    };
    
    var form = new FormData();
    form.append('cmd', evt.target.id);
    for (var i = 0; i < fileList.length; i++) {
        form.append("file_"+i, fileList[i]);
    }
    xhr.send(form);
}