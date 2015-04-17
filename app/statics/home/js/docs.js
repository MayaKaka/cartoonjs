
$(function() {
    var $docs = $('.docs');
        $items = $docs.find('.docs-item');

    $('.accordion h5, .accordion li').click(function(e) {
        var lang = e.target.lang;
        
        $items.hide();
        $docs.find('.'+lang).show();
    })

    var initEditor = function(id, height) {
        var $dom = $('#'+id);
        $dom.css({
            width: 720, height: height
        })
        var editor = ace.edit(id);
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");
    }

    setTimeout(function() {
        initEditor('editor-class', 200);
        initEditor('editor-ticker', 200);
        initEditor('editor-preload', 240);
        initEditor('editor-display', 300);
    });
    
});

