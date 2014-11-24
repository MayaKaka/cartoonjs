
define( function ( require, exports, module ) {
	"use strict";

var DisplayObject = require('display/DisplayObject'),
	Bitmap = require('display/Bitmap'),
	Timeline = require('animation/Timeline');

var SkeletalAnimation = DisplayObject.extend({
	
	type: 'SkeletalAnimation',
	_paused: true,
	
	_bones: null,
	
	_animations: null,
	_currentAnimation: null,
	_timeline: null,
	
	init: function(props) {
		this._super(props);
		// 初始化骨骼节点
		this._initBones(props); 
	},

	play: function(name) {
		// 开启播放
		if (typeof(name) === 'string') {
			this.playAnimation(name);
		} else {
			this._paused = false;
		}
	},
	
	stop: function() {
		// 停止播放
		this._paused = true;
	},
	
	playAnimation: function(name) {
		this._paused = false;
		// 播放动画
		var animation = this._animations[name];
        if (animation) {
            this._currentAnimation = animation;
            this._timeline = this._initTimeline(animation); // 创建动画时间轴
  		}
	},
	
	update: function(delta) {
		if (this._paused) return;
		// 播放时间轴动画
		if (this._timeline) {
			this._timeline.update(delta);	
		}
	},
	
	_initBones: function(props) {
		this._bones = {};
		this._animations = {};
		
		var bones = props.bones,
			animations = props.animations,
			bone, displayObj;
		// 创建骨骼节点
		for (var i=0, l=bones.length; i<l; i++) {
			bone = bones[i];

			if (bone.image) { // 图像节点
				displayObj = new Bitmap({
					renderMode: this.renderMode,
					x: 0, y: 0, width: bone.width, height: bone.height,
					image: bone.image
				});
			} else { // 容器节点
				displayObj = new DisplayObject({
					renderMode: this.renderMode,
					x: 0, y: 0, width: bone.width, height: bone.height
				});
			}
			
			if (!bone.parent) { // 添加根节点
				this.add(displayObj);
			}
			
			this._bones[bone.tag] = displayObj;
		}
		// 添加全部子节点
		for (var i=0, l=bones.length; i<l; i++) {
			bone = bones[i];

			if (bone.parent) { // 添加子节点
				this._bones[bone.parent].add(this._bones[bone.tag]);	
			}		
		}
		// 初始化动画
		for (var i in animations) {
			this._animations[i] = animations[i];
		}
	},
	
	_initTimeline: function(animation) {
		var timeline = new Timeline({ loop: true }),
			data, bone, frames, frame;
		// 初始化时间轴	
		for (var j=0, jl=animation.length; j<jl; j++) {
			data = animation[j];
			bone = this._bones[data.tag];
			frames = data.frames;
			timeline.get(bone);
			// 添加关键帧
			for (var i=0, l=frames.length; i<l; i++) {
				frame = frames[i];
				timeline.addKeyframe(frame, frame.time);
			}
		}
		var self = this;
		timeline.on('timelineend', function() {
			self.trigger({ type: 'animationend', timeline: timeline });
		})
		return timeline;
	}
	
});

return SkeletalAnimation;
});