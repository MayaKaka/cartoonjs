
define( function ( require, exports, module ) {
	"use strict";
	   
var DisplayObject = require('display/DisplayObject'),
	Preload = require('core/Preload');

var Sprite = DisplayObject.extend({
	
	type: 'Sprite',
	
	_paused: true,

    _images: null,
    _imageIndex: -1,

    _frames: null,
    _frameIndex: -1,
    _currentFrame: null,

    _animations: null,
    _currentAnimation: null,
    _deltaTime: -1,
    
    init: function(props) {
		this._super(props);
		// 初始化精灵序列帧
		this._initSpriteSheet(props.spriteSheet || props.ss);
	},
	
    play: function(name) {
    	// 开启播放
		if (typeof(name) === 'string') {
			this.playAnimation(name);
		} else if (typeof(name) === 'number') {
			this.gotoAndPlay(name);
		} else {
			this._paused = false;
		}
    },
    
    stop: function() {
    	// 停止播放
    	this._paused = true;
    },
    
   	gotoAndPlay: function(index) {
   		this._paused = false;
   		// 播放序列帧
   		this._currentAnimation = null;
   		this._frameIndex = index;
   	},
   	
    gotoAndStop: function(index) {
    	this._paused = true;
    	// 播放单帧
    	this._currentAnimation = null;
   		this._frameIndex = index;
   		this._updateFrame();
    },
    
    playAnimation: function(name) {
   		this._paused = false;
   		// 播放动画
   		var animation = this._animations[name];
		if (animation) {
	        this._currentAnimation  = animation;
	        this._frameIndex = animation.start;
			this._deltaTime = 0;
	  	}	
    },
    
    update: function(delta) {
     	if (this._paused) return;
     	// 更新当前帧
     	this._updateFrame();
     	
     	var name, start, end, next, duration,
     		animation = this._currentAnimation;
     	// 获取动画参数
     	if (animation) {
     		name = animation.name;
     		start = animation.start;
     		end = animation.end;
     		next = animation.next;
     		duration = animation.duration;
     	} else {
     		name = null;
     		start = 0;
     		end = this._frames.length - 1;
     		next = true;
     		duration = 0;
     	}
		
		var nextFrameIdx;
		// 计算下一帧
     	if (duration > 0) {
     		this._deltaTime += delta;
     		nextFrameIdx = Math.floor((end - start + 1) * (this._deltaTime / duration) + start);
     	} else {
     		nextFrameIdx = this._frameIndex + 1;
     	}
     	// console.log(this._frameIndex, end, 'start');
		// 判断动画是否结束
		if (nextFrameIdx > end) {
			if (typeof(next) === 'string') { // 播放下一个动画
				this.playAnimation(next);
			} else if (next === true) { // 循环播放
				this._frameIndex = start;
			} else { // 停止播放
				this.stop();
			}
			// 触发动画结束事件
			this.trigger({ type: 'animationend', name: name, animation: animation });
		} else {
			this._frameIndex = nextFrameIdx;
		}
		// console.log(this._frameIndex, this._paused);
	},
       
    draw: function(ctx){
     	var frame = this._currentFrame;
     	// 绘制当前帧
     	if (frame) {
	     	var	image = this._images[frame[4]];
	     	if (image && image.complete) {
	     		ctx.drawImage(image, frame[0], frame[1], frame[2], frame[3], 0, 0, frame[2], frame[3]);
	     	}
     	}
     },

	_initSpriteSheet: function(spriteSheet) {
		this._initImages(spriteSheet.images);
        this._initFrames(spriteSheet.frames);
        this._initAnimations(spriteSheet.animations);
     },
	
	_initImages: function(images) {
		this._images = [];
		// 初始化图片资源
		var image;
		for (var i=0, l=images.length; i<l; i++) {
			image = images[i];
			if (this.renderMode !== 0) {
				if (!Preload.hasItem(image)) { // 初始化image
					Preload.loadFile({ type: 'image', url: image });
				}
				image = Preload.getItem(image);
			}
			this._images.push(image);
		}
	},
	
	_initFrames: function(frames, append) {
		if (!append) {
			this._frames = [];
		}
		// 初始化序列帧
		if (frames instanceof Array) {
			for (var i=0, l=frames.length; i<l; i++) {
				if (frames[i] instanceof Array) {
					this._frames.push(frames[i]);
				} else {
					this._initFrames(frames[i], true);
				}
			}
		} else {
			// 自动切帧
			for (var j=0, jl=frames.rows; j<jl; j++) {
				for (var i=0, l=frames.cols; i<l; i++) {
					if ((j*frames.cols + i) === frames.num) {
						break;
					} else {
						this._frames.push([
							i*frames.width, j*frames.height, // 剪裁坐标
							frames.width, frames.height, // 剪裁尺寸
							frames.image || 0, // 剪裁图片 
							0, 0 // 剪裁偏移坐标
						]);	
					}
				}
			}	
		}
	},
	
	_initAnimations: function(animations) {
		this._animations = {};
		// 初始化动画
		var animation;
		for (var i in animations) {
			animation = animations[i];
			this._animations[i] = {
				name: i, // 动画名
				start: animation[0], // 开始帧下标
				end: animation[1], // 结束帧下标
				next: animation[2], // 下一个动画
				duration: animation[3] // 持续时间
			}
		}
	},
	
	_updateFrame: function() {
		var frame = this._currentFrame 
				  = this._frames[this._frameIndex];
		// 设置当前帧
		if (frame) {
			// 设置帧尺寸
			if (this.width !== frame[2] || this.height !== frame[3]) {
	        	this.style('size', { width: frame[2], height: frame[3] });
	        }
	        
			var transform = this.transform;
			if (transform.translateX !== frame[5] || transform.translateY !== frame[6]) {
				this.style('transform', { translateX: frame[5], translateY: frame[6] });
			}
			
			if (this.renderMode === 0) {
				var style = this.elemStyle;
	        	// 设置剪裁图片
	        	if (this._imageIndex !== frame[4]) {
	        		this._imageIndex = frame[4];
	        		style.backgroundImage = 'url('+ this._images[frame[4]] +')';
	        		style.backgroundRepeat = 'no-repeat';
	        	}
	        	// 设置剪裁坐标
	        	style.backgroundPosition = '-'+ frame[0] +'px -'+ frame[1] +'px';
	        }
		}
	}
	
});

return Sprite;
});