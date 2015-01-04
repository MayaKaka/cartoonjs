
define( function ( require, exports, module ) {
	"use strict";

var EventDispatcher = require('core/EventDispatcher');

var regexpImage = /\.jpg$|\.png$|\.gif$/,
	regexpJson = /\.json$/;

var Loader = EventDispatcher.extend({

	_resources: null,
	_loadQueue: null,
	_loadQueueLength: -1,	

	init: function() {
		this._resources = {};
		this._loadQueue = [];
	},
	
	load: function(manifest) {
		var len = this._loadQueueLength
				= manifest.length,
			url, type;
		for (var i=0; i<len; i++) {
			url = manifest[i];
			if (regexpImage.test(url)) {
				type = 'image';
			} else if (regexpJson.test(url)) {
				type = 'json';
			} else {
				type = 'text';
			}
			this._loadQueue.push({ type: type, url: url });
		}
		
		if (len) {
			this._loadNext();	
		}
	},
	
	loadFile: function(res) {
		if (res.type === 'image') {
			this._loadImage(res);
		} else {
			this._loadJson(res);
		}
	},
	
	hasItem: function(url) {
		return url in this._resources;
	},
	
	getItem: function(url) {
		return this._resources[url];
	},
	
	setItem: function(url, file) {
		this._resources[url] = file;		
	},
	
	_loadComplete: function(res, file) {
		var progress = 1;
		
		if (this._loadQueueLength) {
			progress = 1 - this._loadQueue.length / this._loadQueueLength;		
			this.trigger({
				type: 'progress', progress: progress
			})
		}
		
		res.onload && res.onload(file);
		
		if (progress < 1) {
			this._loadNext();
		} else {
			this._loadQueueLength = 0;
			this.trigger({ type: 'complete', file: file });
		}
	},
	
	_loadNext: function() {
		this.loadFile(this._loadQueue.shift());
	},
	
	_loadImage: function(res) {
		var self = this,
			image = new Image();
		
		image.src = res.url;
		image.onload = function(){
			self._loadComplete(res, image);
		};
		
		this.setItem(res.url, image);
	},
	
	_loadJson: function(res) {
		var self = this, json, text,
			xhr = new XMLHttpRequest();
			
		xhr.onreadystatechange = function () {
			if (xhr.readyState === xhr.DONE) {
				if (xhr.status === 200 || xhr.status === 0) {
					text = xhr.responseText;
					if (text) {
						json = res.type === 'json' ? JSON.parse(text) : text;
						self.setItem(res.url, json);
						self._loadComplete(res, json);
					}
				}
			}
		};
	
		xhr.open('GET', res.url, true);
		xhr.send(null);
	}

});

return Loader;
});