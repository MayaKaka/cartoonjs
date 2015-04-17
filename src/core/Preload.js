
define(function (require) {
    'use strict';

var EventDispatcher = require('core/EventDispatcher');

var regexpHttp = /^(http|https):\/\//,
    regexpQuery = /\?(.*)=(.*)$/,
    regexpImage = /\.jpg$|\.png$|\.gif$/,
    regexpJson = /\.json$/;

var Loader = EventDispatcher.extend({

    _resPath: '',
    _version: '',
    _resources: null,
    _loadQueue: null,
    _loadQueueLength: -1,   

    init: function() {
        this._resources = {};
        this._loadQueue = [];
    },

    load: function(manifest) {
        if (manifest instanceof Array) {
            var len = this._loadQueueLength
                    = manifest.length;
            var url, type;
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
        } else {
            var res = manifest;
            if (res.type === 'image') {
                this._loadImage(res);
            } else {
                this._loadJson(res);
            }
        }
    },

    setResPath: function(path) {
        this._resPath = path;
    },

    setVersion: function(version) {
        this._version = version;
    },

    getUrl: function(url) {
        if (!regexpHttp.test(url)) {
            url = this._resPath + url;
        }
        if (!regexpQuery.test(url) && this._version) {
            url = url + '?v=' + this._version;
        }
        return url;
    },

    has: function(url) {
        return url in this._resources;
    },
    
    get: function(url) {
        return this._resources[url];
    },
    
    set: function(url, file) {
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
        this.load(this._loadQueue.shift());
    },
    
    _loadImage: function(res) {
        var self = this,
            image = new Image();

        image.src = this.getUrl(res.url);

        if (image.complete) {
            self._loadComplete(res, image);
        } else {
            image.onload = function(){
                self._loadComplete(res, image);
            };
        }
        
        this.set(res.url, image);
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
                        self.set(res.url, json);
                        self._loadComplete(res, json);
                    }
                }
            }
        };
        xhr.open('GET', this.getUrl(res.url), true);
        xhr.send(null);
    }

});

return new Loader();
});