
var upload;
var pname = $.query.get('pname');

function onDrag(evt) {
    evt.preventDefault();
}

function onDrop(evt) {
    evt.preventDefault();
    upload && upload(evt);
}

require.config({
    baseUrl: '/src',
    path: {
        'cartoon': 'cartoon',
        'cartoon.particle': 'cartoon.particle',
        'cartoon.ui': 'cartoon.ui',
        'cartoon.three': 'cartoon.three',
    }
})


var modules = [ 'cartoon', 'cartoon.particle', 'cartoon.ui'];

if (window.WebGLRenderingContext) {
    modules.push('cartoon.three');
}

require(modules, function(ct) {
    "use strict";

    pname = $.query.get('pname');
    localStorage.setItem('pname', pname);

    $( ".accordion" ).accordion();

    if (!pname) {
        if (!confirm('你还没有工程，是否访问示例工程？')) {
            pname = prompt('请输入你要创建工程名');
            if (pname) {
                $.ajax({
                    url: '/editor/create-project',
                    data: {
                        pname: pname
                    },
                    success: function(data) {
                        console.log(data);
                        if (data.status) {
                            location.href = location.href + '?pname=' + pname;
                        }
                    }
                });
            }
        } else {
            location.href = location.href + '?pname=test';
        }
    } else {
        var viewer = new ct.Viewer();
        var ticker = ct.Ticker;

        var menuConf = {
            widthOverflowOffset: 0,
            heightOverflowOffset: 1,
            submenuLeftOffset: -4,
            submenuTopOffset: -5,
            onSelect: function(e, context){
                
                var name = $(this).html();
                var obj;
                var parent;

                if (display === 'canvas') {
                    ct.setRenderMode(1);
                } else {
                    ct.setRenderMode(0);
                }

                switch(name)
                {
                    case 'DisplayObject':
                        obj = new ct.DisplayObject({
                            x: 0, y: 0, width: 100, height: 100
                        });
                        break;
                    case 'Bitmap':
                        obj = new ct.Bitmap({
                            x: 0, y: 0,
                            image: '/static/home/img/bear.png', rect: [0, 0, 120, 120]
                        });
                        break;
                    case 'Text':
                        obj = new ct.Text({
                            x: 0, y: 0,
                            width: 120, height: 22, text: 'Hello Baidu!'
                        });
                        break;
                    case 'Sprite':
                        obj = new ct.Sprite({
                            x: 0, y: 0,
                            ss: {
                                images: ['/static/home/img/bear_ani.png'],
                                frames: {
                                    width: 148, height: 148, cols: 50, rows: 1
                                },
                                animations: {
                                    all: [0, 49, true, 2500]
                                }
                                //, originName: 'bear'
                            }
                        });
                        obj.play('all');
                        break;
                    case 'Button':
                        obj = new ct.Button({
                            x: 0, y: 0,
                            ss: {
                                images: ['/static/home/img/btn_0.png', '/static/home/img/btn_1.png', '/static/home/img/btn_2.png'],
                                frames: [
                                    [0,0,103,40,0,0,0],
                                    [0,0,103,40,1,0,0],
                                    [0,0,103,40,2,0,0]
                                ]
                            }
                        });
                        break;
                    case 'TextField':
                        obj = new ct.TextField({
                            x: 0, y: 0, width: 120, height: 24, size: 22
                        });
                        break;
                    case 'Rect':
                        obj = new ct.Rect({
                            x: 0, y: 0,
                            width: 120, height: 120, fill: 'rgb('+ct.random(0,255)+','+ct.random(0,255)+','+ct.random(0,255)+')'
                        });
                        break;
                    case 'Circle':
                        obj = new ct.Circle({
                            x: 0, y: 0,
                            radius: 60, fill: 'rgb('+ct.random(0,255)+','+ct.random(0,255)+','+ct.random(0,255)+')'
                        });
                        break;
                    case 'Ring':
                        obj = new ct.Ring({
                            x: 0, y: 0,
                            radius: 60, angle:270, stroke: 'rgb('+ct.random(0,255)+','+ct.random(0,255)+','+ct.random(0,255)+')', strokeWidth: 10
                        });
                        break;
                    case 'Line':
                        obj = new ct.Line({
                            x: 0, y: 0,
                            path: [[0, 0], [120, 120]], stroke: 'rgb('+ct.random(0,255)+','+ct.random(0,255)+','+ct.random(0,255)+')'
                        });
                        break;
                    case 'Ploygon':
                        obj = new ct.Ploygon({
                            x: 0, y: 0,
                            path: [[0, 0], [0, 120], [100, 60]], fill: 'rgb('+ct.random(0,255)+','+ct.random(0,255)+','+ct.random(0,255)+')'
                        });
                        break;
                    case 'rain':
                        obj = new ct.ParticleSystem({
                            x: 0, y: 0,
                            p: { type: 'rain', width: 700, height: 600 }
                        });
                        break;
                    case 'snow':
                        obj = new ct.ParticleSystem({
                            x: 0, y: 0,
                            p: { type: 'snow', width: 700, height: 600 }
                        });
                        break;
                    case 'box':
                        obj = ct.Object3D.create({
                            g: { type: 'box', size: [ 5, 5, 5 ] },
                            m: { type: 'basic', wireframe: true }
                        });
                        obj.style({ x: ct.random(-30, 30), y: ct.random(-30, 30) });
                        break;
                    case 'sphere':
                        obj = ct.Object3D.create({
                            g: { type: 'sphere', radius: 3 },
                            m: { type: 'basic', wireframe: true }
                        });
                        obj.style({ x: ct.random(-30, 30), y: ct.random(-30, 30) });
                        break;
                    case 'Folder':
                        $.ajax({
                            url: '/editor/create-folder',
                            data: {
                                path: folderPath + '/' + prompt('输入目录名称'),
                                pname: pname 
                            },
                            success: function() {
                                refreshAsset(folderPath);
                            }
                        })
                        break;
                    case 'tween':
                        hideAll();
                        $('.timeline').show();
                        break;
                    case 'css':
                        hideAll();
                        $('.main-css').show();
                        cssEditor.setValue(pjData.css || '');
                        break;
                    case 'script':
                        hideAll();
                        showScript();
                        break;
                    case 'delete':
                        parent = target.parent;
                        target.parent.remove(target);
                        sceneTree.removeNode(sceneTree.getNodeByParam('pid', target.pid)); 
                        target = parent;
                        break;
                    default:
                        return false;
                        break;
                }

                if (obj) {
                    if (target) {
                        if (viewer.isContainer(target.type)) {
                            parent = target; 
                        } else {
                            parent = target.parent;
                        }
                    } else {
                        parent = eval(display);
                    }
                    
                    parent.add(obj);
                    sceneTree.addNodes(sceneTree.getNodeByParam('pid', parent.pid), [viewer.jsonTree(obj)]);

                    target = obj;
                }

                uploadData();
                
                return true;
            },
            onShow: function(e, context){
                $('.add-res').hide();
                $('.add-3d').hide();
                $('.add').hide();
                $('.edit').hide();
                if (display === 'stage' || display === 'canvas') {
                    $('.add').show();
                    $('.edit').show();
                } else if (display === 'glcanvas' ) {
                    $('.add-3d').show();
                } else if (display === 'asset') {
                    $('.add-res').show();
                }
            }            
        };

        $('.main').jeegoocontext('menu', menuConf);

        var $header = $('.header');
        var $main = $('.main');
        var $accordion = $('.accordion');
        var $info = $('.info');
        var $fps = $('.main-fps');
        var $script = $('.main-script');
        var $asset = $('.main-asset');
        var $sprite = $('.main-sprite');
        
        var $mark = $('.main-mark'),
            $markLine = $mark.find('.mark-line'),
            $line00 = $mark.find('.mark-line00'),
            $line01 = $mark.find('.mark-line01'),
            $line02 = $mark.find('.mark-line02'),
            $line03 = $mark.find('.mark-line03');

        var $markPt = $mark.find('.mark-pt'),
            $pt00 = $mark.find('.mark-pt00'),
            $pt01 = $mark.find('.mark-pt01'),
            $pt02 = $mark.find('.mark-pt02'),
            $pt03 = $mark.find('.mark-pt03');

        var markX, markY, markW, markH, markRo, markSc;
        $line02.on({
            mousedown: function(evt) {
                $line02.down = true;
                if (target) {
                    markX = evt.clientX;
                    markW = target.width;
                }
            }
        });
        $line03.on({
            mousedown: function(evt) {
                $line03.down = true;
                if (target) {
                    markY = evt.clientY;
                    markH = target.height;
                }
            }
        });
        $pt01.on({
            mousedown: function(evt) {
                $pt01.down = true;
                if (target) {
                    markX = evt.clientX;
                    markRo = target.transform.rotate;
                }
            }
        });
        $pt02.on({
            mousedown: function(evt) {
                $pt02.down = true;
                if (target) {
                    markX = evt.clientX;
                    markRo = target.transform.rotate;
                }
            }
        });
        $pt03.on({
            mousedown: function(evt) {
                $pt03.down = true;
                if (target) {
                    markY = evt.clientY;
                    markSc = target.transform.scale;
                }
            }
        });

        $main.on({
            mousedown: function(evt) {
                evt.preventDefault();
            },
            mousemove: function(evt) {
                evt.preventDefault();
                if (target) {
                    if ($line02.down) {
                        target.style('width', markW + evt.clientX - markX);
                    } else if ($line03.down) {
                        target.style('height', markH + evt.clientY - markY)
                    } else if ($pt01.down || $pt02.down) {
                        target.style('transform', {
                            rotate: markRo + evt.clientX - markX
                        })
                    } else if ($pt03.down) {
                        target.style('transform', {
                            scale: markSc + (evt.clientY - markY)/100
                        })
                    }
                }
            },
            mouseup: function() {
                down = false;
                $line02.down = false;
                $line03.down = false;
                $pt01.down = false;
                $pt02.down = false;
                $pt03.down = false;
            }
        });
        
        

        var stage;
        var canvas;
        var glcanvas;
        var spriteConitaner;
        var target;
        var stageSize = { width: 0, height: 600 };
        var down = false;
        var moved = false;

        var updateMark = function() {
            if (target) {
                var mtx = target._updateWorldMatrix(),
                    w = target.width,
                    h = target.height,
                    ax = target._getAnchorX(),
                    ay = target._getAnchorY();

                $markLine.css('transform', 'matrix('+mtx.a+','+mtx.b+','+mtx.c+','+mtx.d+','+mtx.tx+','+mtx.ty+')');
                $line00.css({ left: 0, top: 0, width: w });
                $line01.css({ left: 0, top: 0, height: h });
                $line02.css({ left: w, top: 0, height: h });
                $line03.css({ left: 0, top: h, width: w });
                $markPt.css('transform', 'matrix('+mtx.a+','+mtx.b+','+mtx.c+','+mtx.d+','+mtx.tx+','+mtx.ty+')');
                $pt00.css({ left: 0, top: 0 });
                $pt01.css({ left: 0, top: h });
                $pt02.css({ left: w, top: 0 });
                $pt03.css({ left: w, top: h });
            }
        }

        var updateInfo = function() {
            if (!$info.seleted && target) {
                $('.info #type').val(target.type);
                $('.info #tag').val(target.tag || '');
                $('.info #x').val(target.x);
                $('.info #y').val(target.y);
                $('.info #width').val(target.width);
                $('.info #height').val(target.height);
                $('.info #translateX').val(target.transform.translateX);
                $('.info #translateY').val(target.transform.translateY);
                $('.info #rotate').val(target.transform.rotate);
                $('.info #scaleX').val(target.transform.scaleX);
                $('.info #scaleY').val(target.transform.scaleY);
                $('.info #skewX').val(target.transform.skewX);
                $('.info #skewY').val(target.transform.skewY);
                $('.info #alpha').val(target.alpha);
                $('.info #visible')[0].checked = target.visible;
                $('.info #shadow').val(target.shadow);
                $('.info #cursor').val(target.cursor);
                $('.info #script').val(target.script || '');

                $('.info-priv').find('table').hide();
                $('.info-priv').find('.'+target.type).show();

                switch(target.type) {
                    case 'Bitmap':
                        $('.info #image').val(target._image);
                        $('.info #rect_x').val(target._srcRect.x);
                        $('.info #rect_y').val(target._srcRect.y);
                        break;
                    case 'Text':
                        $('.info #text').val(target._text);
                        break;
                    case 'Sprite':
                        $('.info #ss').val(target._spriteSheet.originName);
                        break;
                }
            }
        }

        var changeInfo = function(evt) {
            var id = evt.target.id,
                val = evt.target.value,
                obj;
            switch(id) {
                case 'tag':
                    viewer.setTag(target, val);
                    var node = sceneTree.getNodeByParam('pid', target.pid);
                    node.name = viewer.getName(target);
                    sceneTree.updateNode(node);
                    break;
                case 'x':
                case 'y':
                case 'width':
                case 'height':
                case 'alpha':
                    target.style(id, parseFloat(val));
                    break;
                case 'shadow':
                case 'cursor':
                    target.style(id, val);
                    break;
                case 'translateX':
                case 'translateY':
                case 'rotate':
                case 'scaleX':
                case 'scaleY':
                case 'skewX':
                case 'skewY':
                    obj = {};
                    obj[id] = parseFloat(val);
                    target.style('transform', obj);
                    break;
                case 'visible':
                    val = evt.target.checked;
                    target.style(id, val);

                    var node = sceneTree.getNodeByParam('pid', target.pid);
                    node.name = viewer.getName(target);
                    sceneTree.updateNode(node);
                    break;
                case 'image':
                    target.source(val);
                    break;
                case 'text':
                    target.value(val);
                    break;
                case 'ss':
                    target._initSpriteSheet(val);
                    break;
            }

            uploadData();
        }

        $info.find('input, select').on({
            focus: function() {
                $info.seleted = true;
            },
            blur: function() {
                $info.seleted = false;
            },
            change: changeInfo
        });

        var initStage = function() {
            pjData.scenes = pjData.scenes || {};
            var sceneData = pjData.scenes.stage;
            if (sceneData) {
                sceneData.elem = '.main-stage';
                stage = viewer.parse(sceneData);
            } else {
                stage = new ct.Stage({
                    elem: '.main-stage', x: 0, y: 0, width: stageSize.width, height: stageSize.height
                });
            }
            sceneNodes.push(viewer.jsonTree(stage, true));

            if (sceneData) {
                sceneData.elem = '.main-canvas canvas';
                sceneData.type = 'Canvas';
                sceneData.render = 1;
                canvas = viewer.parse(sceneData);
            } else {
                canvas = new ct.Canvas({
                    elem: '.main-canvas canvas', x: 0, y: 0, width: stageSize.width, height: stageSize.height
                });
            }
            sceneNodes.push(viewer.jsonTree(canvas, true));
            

            if (ct.GLCanvas) {
                glcanvas = new ct.GLCanvas({
                    elem: '.main-glcanvas canvas', x: 0, y: 0, width: stageSize.width, height: stageSize.height
                });
                glcanvas.camera.position.set(0,0,60);
            }
            
            spriteConitaner = new ct.Stage({
                elem: '.main-sprite', x: 0, y: 0, width: stageSize.width, height: stageSize.height
            });
            sceneNodes.push(viewer.jsonTree(glcanvas, true));

            sceneTree = zTree.init($sceneTree, sceneConf, sceneNodes);

            
            ticker.add(ct.Tween);
            ticker.add(updateMark);
            ticker.add(updateInfo);
            ticker.add(function(delta) {
                if (display === 'stage') {
                    stage.update(delta);
                } else if(display === 'canvas') {
                    canvas.update(delta);
                } else if(display === 'glcanvas') {
                    glcanvas.update(delta);
                } else if (display === 'sprite') {
                    spriteConitaner.update(delta);
                }
                $fps.html(ticker.fps);
            });
            ticker.start();

            var sx, sy, px, py;

            var handleDown = function(evt) { 
                var touched = false;
                if (evt.srcTarget !== stage && evt.srcTarget !== canvas) {
                    // target && target.style('shadow', '');
                    // target = evt.srcTarget;
                    touched = true;
                    $mark.show();
                    $fps.show();
                }
                if (target === stage || target === canvas){
                    touched = false;
                }
                if (target && touched) {
                    down = true;
                    sx = evt.mouseX;
                    sy = evt.mouseY;
                    px = target.x;
                    py = target.y;
                    $info.find('input').blur();
                    // target.style('shadow', '0px 0px 15px red');
                }
                moved = false;
            }

            var handleMove = function(evt) {
                if (down) {
                    moved = true;
                    target.style({
                        x: px + evt.mouseX - sx,
                        y: py + evt.mouseY - sy
                    })
                }
            }

            var handleUp = function(evt) {
                down = false;
                if (moved) {
                    uploadData();
                }
            }

            stage.on('mousedown', handleDown);
            stage.on('mousemove', handleMove);
            stage.on('mouseup', handleUp);

            canvas.on('mousedown', handleDown);
            canvas.on('mousemove', handleMove);
            canvas.on('mouseup', handleUp);
        }

        var resize = function() {
        	var winSize = ct.getWinSize();

            var scroll = document.body.style.overflow !== "hidden" && document.body.scroll !== "no" && document.body.scrollHeight > window.innerHeight;
            
            stageSize.width = winSize.width - $accordion.width() - $info.width() - (scroll ? 54: 36);
            $main.show();

            if (stage) {
            	stage.style(stageSize);
                canvas.style(stageSize);
                if (glcanvas) {
                    glcanvas.style(stageSize);
                    glcanvas.$.css(stageSize);
                }
                spriteConitaner.style(stageSize);
            }
  
        };

        var showScript = function() {
            $('.main-script').show();
            jsEditor.setValue(target.script || '');
            if (target._scriptPos) {
                jsEditor.gotoLine(target._scriptPos.row+1, target._scriptPos.column, true);
            }
        }

        var updateCss = function() {
            var css = pjData.css || '';
            var id = 'css';
            var $css = $('#'+id);

            if ($css[0]) {
                $css.html(css);
            } else {
                $css = $('<style id="'+id+'">'+ css +'</style>');
                $css.appendTo(document.body);
            }
        }

        var uploadData = function() {
            pjData.scenes.stage = viewer.json(stage);

            $.ajax({
                type: 'POST',
                url: '/editor/save-project',
                data: {
                    pname: pname,
                    pdata: JSON.stringify(pjData)
                }
            });
        }
        var zTree = $.fn.zTree;

        var $sceneTree = $('#sceneTree');
        var $spriteTree = $('#spriteTree');
        var $assetTree = $('#assetTree');

        var sceneTree;
        var spriteTree;
        var assetTree;

        var pjData;
        var display = 'stage';
        var folderPath;

        var changeDisplay = function(displayName, className) {
            $('.main-show').removeClass('main-show');
            $(className).addClass('main-show');
            display = displayName;
            $mark.hide();
            $script.hide();
        }

        var sceneConf = {
            edit: { 
                enable: true, 
                showRemoveBtn: false, 
                showRenameBtn: false, 
                drag: {} 
            },
            view: { 
                dblClickExpand: false, 
                showLine: true, 
                selectedMulti: false,
                nameIsHTML: true
            },
            data: {
                keep: { 
                    parent:true, 
                    leaf:true 
                },
                simpleData: { 
                    enable:true, 
                    idKey: "id", 
                    pIdKey: "pId", 
                    rootPId: "" 
                }
            },
            callback: {
                beforeDrag: function(treeId, treeNodes) {
                    for (var i=0, l=treeNodes.length; i<l; i++) {
                        if (treeNodes[i].drag !== true) {
                            return false;
                        }
                    }
                    return true;
                },
                beforeDrop: function(treeId, treeNodes, targetNode, moveType) {
                    var origin = viewer.get(treeNodes[0].pid),
                        target = viewer.get(targetNode.pid),
                        parent = target.parent,
                        index;

                    if (!targetNode.drag) {
                        return false;
                    }
                    if (moveType==='inner' && targetNode.isParent) {
                        origin.parent.remove(origin);
                        target.add(origin);
                        uploadData();
                        return true;
                    } else if (moveType==='prev') {
                        index = parent.children.indexOf(target);
                        origin.parent.remove(origin);
                        parent.addAt(origin, index);
                        uploadData();
                        return true;
                    } else if (moveType==='next') {
                        index = parent.children.indexOf(target);
                        origin.parent.remove(origin);
                        parent.addAt(origin, index+1);
                        uploadData();
                        return true;
                    }
                    return false;
                },
                beforeClick: function(treeId, treeNode) {
                    var nodeName = treeNode.name;

                    switch(nodeName) {
                        case 'Stage': 
                            changeDisplay('stage', '.main-stage'); 
                            break;
                        case 'Canvas': 
                            changeDisplay('canvas', '.main-canvas'); 
                            break;
                        case 'GLCanvas': 
                            changeDisplay('glcanvas', '.main-glcanvas'); 
                            break;
                        default:
                            
                            break;
                    }

                    var pid = treeNode.pid,
                        obj = viewer.get(pid);

                    if (obj) {
                        target = obj;
                        $mark.show();
                        $fps.show();
                    }

                    $('.info input').blur();
                    hideAll();
                }
            }
        };

        var spriteConf = {
            callback: {
                beforeClick: function(treeId, treeNode) {
                    var nodeName = treeNode.name;
                    changeDisplay('sprite', '.main-sprite');
                    
                    if (treeNode.isParent) {
                        if (!treeNode.children) {
                            refreshSprite();
                        }
                        // var sprite = new ct.Sprite({
                        //     render: 0,
                        //     x: 100, y: 100,
                        //     ss: pjData.sprites[nodeName]
                        // });
                        // target = sprite;
                        // $mark.show();
                        // sprite.play('all');
                        // spriteConitaner.removeAll();
                        // spriteConitaner.add(sprite);    
                    }
                }
            }
        }

        var assetConf = {
            callback: {
                beforeClick: function(treeId, treeNode) {
                    var nodeName = treeNode.name;

                    changeDisplay('asset', '.main-asset');

                    if (treeNode.isParent) {
                        if (treeNode.children) {
                            folderPath = treeNode.path;
                            showAsset(treeNode.children)
                        } else {
                            refreshAsset(treeNode.path);
                        }
                    }
                }
            }
        }

        var sceneNodes = [
            
        ];

        var spriteNodes = [
            { name: 'sprites', isParent: true, data: '', children: [

            ]}
        ];

        var assetNodes = [
            { name: 'assets', isParent: true, path: '', children: [

            ]}
        ]
        
        var refreshSprite = function() {
            $.ajax({
                url: '/editor/load-sprite',
                data: {
                    pname: pname
                },
                success: function(data) {
                    var node = spriteTree.getNodeByParam('data', '');
                    spriteTree.removeChildNodes(node);
                    spriteTree.addNodes(node, data);
                    showSprite(data);
                }
            });
        }   

        var sprites;
        var curSprite;

        var showSprite = function(data) {
            sprites = {};
            var html = '';
            data.forEach(function(a, i) {
                sprites[a.name] = a.data;
                html += '<div class="asset-item">';
                html += '<img src="' + a.data.images[0] + '" lang="'+a.name+'">'
                html += '<p>' + a.name + '</p>';
                html += '</div>';
            });
            $sprite.find('.sprite-panel').html(html);

            $('.main-sprite img').hover(function() {
                var data = sprites[$(this).attr('lang')];
                curSprite = new ct.Sprite({
                    render: 0, x: 0, y: 0, ss: data
                });
                curSprite.play('all');
                ticker.add(curSprite);
                $('.sprite-play').show().append(curSprite.$);
            }, function() {
                ticker.remove(curSprite);
                $('.sprite-play').hide()
                curSprite.$.remove();
                curSprite = null;
            });
        }

        var uploadSprite = function(evt) {
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
                        refreshSprite();
                    }
                }
            };
            
            var form = new FormData();
            form.append('cmd', 'merge');
            form.append('pname', pname);
            form.append('sname', prompt('输入帧动画名称'));
            for (var i = 0; i < fileList.length; i++) {
                form.append("file_"+i, fileList[i]);
            }
            xhr.send(form);
        }

        var uploadAsset = function(evt) {
            var fileList = evt.dataTransfer.files;
            if (fileList.length === 0) { 
                return; 
            }

            var xhr = new XMLHttpRequest();
            xhr.open("post", "/editor/upload-resource", true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status === 200 || xhr.status === 0) {
                        refreshAsset(folderPath);
                    }
                }
            };
            
            var form = new FormData();
            form.append('pname', pname);
            console.log(folderPath);
            form.append('path', folderPath);
            for (var i = 0; i < fileList.length; i++) {
                form.append("file_"+i, fileList[i]);
            }
            xhr.send(form);
        }

        upload = function(evt) {
            if (display === 'sprite') {
                uploadSprite(evt);
            } else if (display === 'asset') {
                uploadAsset(evt);
            }
        };

        var refreshAsset = function(path) {
            folderPath = path;
            $.ajax({
                url: '/editor/load-resource',
                data: {
                    pname: pname,
                    path: path
                },
                success: function(data) {
                    var node = assetTree.getNodeByParam('path', path);
                    assetTree.removeChildNodes(node);
                    assetTree.addNodes(node, data);
                    showAsset(data);
                }
            });
        }

        var showAsset = function(data) {
            var html = '';
            data.forEach(function(a, i) {
                html += '<div class="asset-item">';
                if (a.isParent) {
                    html += '<img src="/static/home/img/folder.png" lang="'+a.path+'">'
                } else {
                    html += '<img src="' + (pjData.path+'res'+a.path) + '">'
                }
                html += '<p>' + a.name + '</p>';
                html += '</div>';
            });
            $asset.find('.asset-panel').html(html);
        }

        $.ajax({
            url: '/editor/load-project',
            data: {
                pname: pname
            },
            success: function(data) {
                console.log(data);
                pjData = data;
                if (!data) {
                    alert('没有数据');
                } else {
                    spriteTree = zTree.init($spriteTree, spriteConf, spriteNodes);
                    assetTree = zTree.init($assetTree, assetConf, assetNodes);
                    
                    $(window).on('resize', resize);
                    resize();
                    
                    initStage();
                    refreshSprite();
                    refreshAsset('');
                    updateCss();
                }
            }
        });

        $('.tab .play').click(function() {
            window.open('/player?pname=' + pname);
        })

        $('.tab .play-ala').click(function() {
            window.open('/static/home/aladdin.html?pname=' + pname);
        });

        $('.tab .css-sprite').click(function() {
            $.ajax({
                url: '/sprite/merge',
                data: {
                    pname: pname
                },
                success: function(data) {
                    console.log('合并成功');
                    window.d = data;
                }
            });
        });
        
        $('.tab .export').click(function() {
             $.ajax({
                url: '/editor/export-project',
                data: {
                    pname: pname
                },
                success: function(data) {
                    console.log('导出成功');
                }
            });
        });

        var $grid = $('<style>.main-stage div { box-shadow: 0 0 1px 1px red; }</style>')
        $('.tab .grid').on('change', function() {
            if (this.checked) {
                $grid.appendTo(document.body);
            } else {
                $grid.remove();
            }
        });

        
        var txtEditor = ace.edit("txtEditor");
        txtEditor.setTheme("ace/theme/monokai");
        txtEditor.getSession().setMode("ace/mode/html");
        txtEditor.commands.addCommand({
            name: 'myCommand',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function(cssEditor) {
                if ($('.main-txt').css('display') === 'block') {
                    target.value(txtEditor.getValue());
                    uploadData();
                }
            },
            readOnly: true // 如果不需要使用只读模式，这里设置false
        });

        var cssEditor = ace.edit("cssEditor");
        cssEditor.setTheme("ace/theme/monokai");
        cssEditor.getSession().setMode("ace/mode/css");
        cssEditor.commands.addCommand({
            name: 'myCommand',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function(cssEditor) {
                if ($('.main-css').css('display') === 'block') {
                    pjData.css = cssEditor.getValue();
                    updateCss();
                    uploadData();
                }
            },
            readOnly: true // 如果不需要使用只读模式，这里设置false
        });

        var jsEditor = ace.edit("jsEditor");
        jsEditor.setTheme("ace/theme/monokai");
        jsEditor.getSession().setMode("ace/mode/javascript");
        jsEditor.commands.addCommand({
            name: 'myCommand',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function(jsEditor) {
                if ($('.main-script').css('display') === 'block') {
                    target.script = jsEditor.getValue();
                    var node = sceneTree.getNodeByParam('pid', target.pid);
                    node.name = viewer.getName(target);
                    sceneTree.updateNode(node);
                    uploadData();
                }
            },
            readOnly: true // 如果不需要使用只读模式，这里设置false
        });

        var hideAll = function() {
            if ($('.main-script').css('display') === 'block') {
                target._scriptPos = jsEditor.getCursorPosition();
            }

            $('.main-sprite').hide();
            $('.main-asset').hide();
            $('.main-txt').hide();
            $('.main-css').hide();
            $('.main-script').hide();
        }

        $('.main-sprite .close').click(hideAll);
        $('.main-asset .close').click(hideAll);
        $('.main-txt .close').click(hideAll);
        $('.main-css .close').click(hideAll);
        $('.main-script .close').click(hideAll);

        $('#ss').next().click(function() {
            if (target) {
                hideAll();
                $('.main-sprite').show();
            }
        });

        $('#image').next().click(function() {
            if (target) {
                hideAll();
                $('.main-asset').show();
                var node = assetTree.getNodeByParam('path', folderPath);
                showAsset(node.children);
            }
        });

        $('#text').next().click(function() {
            if (target) {
                hideAll();
                $('.main-txt').show();
                txtEditor.setValue(target._text || '');
            }
        });

        $('#script').next().click(function() {
            if (target) {
                hideAll();
                showScript();
            }
        });



        $('.main-asset').click(function(evt) {
            if (display === 'stage' && target && target.type === 'Bitmap') {
                var img = evt.target;
                if (img.tagName.toLowerCase() === 'img') {

                    if (img.lang) {
                        refreshAsset(img.lang);
                    } else {
                        var w = img.naturalWidth,
                            h = img.naturalHeight,
                            src = img.src;

                        src = src.substring(src.indexOf(location.hostname), src.length).replace(location.hostname, '');
                        target.source(src, [0, 0, w, h]);
                        $asset.hide();
                        uploadData();
                    }
                }
            }
        });

        $('.main-sprite').click(function(evt) {
            if (display === 'stage' && target && target.type === 'Sprite') {
                var img = evt.target;
                if (img.tagName.toLowerCase() === 'img') {
                    var ss = sprites[img.lang];
                    if (ss) {
                        target._initSpriteSheet(ss);
                        target.play('all');
                        $sprite.hide();
                        uploadData();    
                    }
                }
            }
        });

        $('#sceneTree').click(function(evt) {
            var tgt = evt.target;
            
            if ($(tgt).hasClass('edit')) {
                hideAll();
                setTimeout(function() {   
                    showScript();
                }, 1);
            }
        });

    }
});