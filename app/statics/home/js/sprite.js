function onDrag(evt) {
    evt.preventDefault();
}

function onDrop(evt) {
    evt.preventDefault();
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

            }
        }
    };

    var form = new FormData();
    form.append('cmd', 'comm');
    for (var i = 0; i < fileList.length; i++) {
        form.append("file_"+i, fileList[i]);
    }       
    xhr.send(form);
}