
define( function ( require, exports, module ) {
	"use strict";
	 
var Class = require('core/Class');

// 事件派发器，参见 https://github.com/mrdoob/eventdispatcher.js
var EventDispatcher = Class.extend({
	
	_listeners: null,
	
	on: function(type, listener, tag) {
		// 绑定事件
		this.addEventListener(type, listener);
		// 添加监听器标签
		if (typeof(tag) === 'string') {
			this._listeners['@' + type + '.' + tag] = [ listener ];
		}
	},
	
	off: function(type, tag) {
		// 解绑事件
		var listener;
		// 通过标签查找监听器
		if (typeof(tag) === 'string') {
			tag = '@' + type + '.' + tag;
			listener = this._listeners[tag][0];
			delete this._listeners[tag];
		} else {
			listener = tag;
		}
		
		this.removeEventListener(type, listener);
	},
	
	trigger: function(evt) {
		// 触发事件
		this.dispatchEvent(evt);
	},
	
	addEventListener: function(type, listener) {
		if (!this._listeners) this._listeners = {};

		var listeners = this._listeners,
			listenerArray = listeners[type];
			
		if (!listenerArray) {
			listenerArray = listeners[type] = [];
		}	
		// 添加事件函数
		if (listenerArray.indexOf(listener) === - 1) {
			listenerArray.push(listener);
		}
	},

	hasEventListener: function(type, listener) {
		if (!this._listeners) return false;

		var listeners = this._listeners,
			listenerArray = listeners[type];
		// 检测事件函数
		if (listenerArray) {
			if (listener) {
				return listenerArray.indexOf(listener) !== - 1;
			}
			return listenerArray.length > 0;
		}

		return false;
	},

	removeEventListener: function(type, listener) {
		if (!this._listeners) return;

		var listeners = this._listeners,
			listenerArray = listeners[type];

		if (listenerArray) {
			if (listener) {
				var index = listenerArray.indexOf(listener);
				// 移除事件函数
				if (index !== - 1) {
					listenerArray.splice(index, 1);
				}	
			} else if (listenerArray.length > 0) {				 
				listeners[type] = [];
			}
		}
	},

	dispatchEvent: function(evt) {
		if (!this._listeners) return;

		var listeners = this._listeners,
			listenerArray = listeners[evt.type];

		if (listenerArray) {
			evt.target = this;
			// 遍历执行事件函数
			for (var i=0, l=listenerArray.length; i<l; i++) {
				listenerArray[i].call(this, evt);
			}
		}
	}
	
});

return EventDispatcher;
});