var fs = require('fs');

var FileUtil = {
    // 复制文件, 并传入相应参数
    copyFile:function(path, targetPath, params){
        fs.readFile(path,'UTF-8',function(err, text){
            if (err) console.log(err);
            if (params) {
                params.forEach(function(a, i) {
                    text = FileUtil.replaceParam(text, a[0], a[1]);
                });
            }
            fs.writeFile(targetPath, text, 'UTF-8');
        });
    },

    // 传入参数
    replaceParam: function(text, name, value){
        var reg = eval('/<\\%=\\s*'+ name +'\\s*\\%>/g');
        return text.replace(reg, value);
    },

    // 删除目录
    deleteFolderRecursive: function(path) {
        var files = [];
        if( fs.existsSync(path) ) {
            files = fs.readdirSync(path);
            files.forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) { // recurse
                    FileUtil.deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    },
    
    // 上传文件
    handleUpload: function(file, path, ctrl) {
        // 获得文件的临时路径
        var tmp_path = file.path;
        // 指定文件上传后的目录 - 示例为"images"目录。 
        var target_path = path +'/'+file.name;
        // 移动文件
        fs.rename(tmp_path, target_path, function(err) {
          if (err) throw err;
          // 删除临时文件夹文件,
          fs.unlink(tmp_path, function() {
             if (err) throw err;
             if (ctrl) {
                ctrl.finish('File uploaded to: ' + target_path + ' - ' + file.size + ' bytes');
             }
          });
        });
    }
};

module.exports = FileUtil;