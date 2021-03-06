
define(function (require) {
    'use strict';

var cartoon = require('cartoon'),
    DisplayObject = cartoon.DisplayObject,
    Bitmap = cartoon.Bitmap;

var Button = DisplayObject.extend({

    type: 'Button',
    
    _status: -1, // 0:正常  1:按下  2:hover  3:禁用
    _spriteSheet: null,
    _images: null,
    _frames: null,
    
    init: function(props) {
        this._super(props);
        this._initUI(props.spriteSheet || props.ss);
    },

    _initUI: function(spriteSheet) {
        this._spriteSheet = spriteSheet;
        this._images = spriteSheet.images,
        this._frames = spriteSheet.frames;

        var self = this;
        var len = this._frames.length > 4 ? 4 : this._frames.length;  
        var bmp, frame, image;

        for (var i=0, l=len; i<l; i++) {
            frame = this._frames[i];
            image = this._images[frame[4]];
            bmp = new Bitmap({ render: this.renderMode, image: image, rect: frame, visible: false });
            bmp.data({
                offsetX: frame[5], offsetY: frame[6]
            });
            bmp.enable(false);
            this.add(bmp);
        }

        this.on('mousedown', function() {
            self.status(1);
        });
        this.on('mouseup', function() {
            self.status(0);
        });
        this.status(0);
    },

    status: function(status) {
        var child = this.children[this._status];
        if (child) {
            child.style('visible', false);
        }
        
        this._status = status;

        child = this.children[this._status];
        child.style('visible', true);
        this.style({
            width: child.width, height: child.height,
            transform: { translateX: child.data('offsetX'), translateY: child.data('offsetY') }
        });
    }
    
});

return Button;
});