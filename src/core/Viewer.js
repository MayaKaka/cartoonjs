
define(function (require) {
    'use strict';

var ct = require('cartoon');
    
var Viewer = ct.Class.extend({
    
    _sprites: null,

    init: function() {
        this._sprites = {};
    },

    getSprite: function(name) {
        return this._sprites[name];
    },

    parse: function(json) {
        return this.parseObj(json, true);
    },

    parseObj: function(json, root) {
        var self = this;
        if (root) {
            ct.setRenderMode(json.render);
        }

        var obj = this.parseDisplayObj(json);

        if (json.children) {
            json.children.forEach(function(a, i) {
                obj.add(self.parseObj(a));
            });
        }
    },

    parseDisplayObj: function(json) {
        var obj;
        switch(json.type) {
            case 'Bitmap':
                obj = new ct.Bitmap(json);
                break;
            case 'Text':
                obj = new ct.Text(json);
                break;
            case 'Sprite':
                obj = new ct.Sprite(json);
                break;
            case 'Rect':
                obj = new ct.Rect(json);
                break;
            case 'Circle':
                obj = new ct.Circle(json);
                break;
            case 'Button':
                obj = new ct.Button(json);
                break;
        }
        return obj;
    },

    json: function(obj) {
        return this.jsonObj(obj, true);
    },

    jsonObj: function(obj, root) {
        var self = this;

        var json = {
            type: obj.type
        }

        if (root) json.render = obj.renderMode;
        
        this.get(json, obj, 'x', 0);
        this.get(json, obj, 'y', 0);
        this.get(json, obj, 'width', 0);
        this.get(json, obj, 'height', 0);
        this.get(json, obj, 'alpha', 1);
        this.get(json, obj, 'visible', true);

        this.jsonDisplayObj(json, obj);

        if (obj.children.length) {
            json.children = [];
            obj.children.forEach(function(a, i) {
                json.children.push(self.jsonObj(a));
            });
        }
        return json;
    },

    jsonDisplayObj: function(json, obj) {
        switch(obj.type) {
            case 'Bitmap':
                json.image = obj._image;
                json.rect = [obj._srcRect.x, obj._srcRect.y, obj.width, obj.height] 
                break;
            case 'Text':
                json.text = obj._text;
                break;
            case 'Sprite':
                json.ss = obj._spriteSheet.originName || obj._spriteSheet;
                break;
            case 'Rect':
                this.get(json, obj, 'fill', undefined);
                this.get(json, obj, 'stroke', undefined);
                this.get(json, obj, 'strokeWidth', undefined);
                break;
            case 'Circle':
                this.get(json, obj, 'radius', undefined);
                this.get(json, obj, 'fill', undefined);
                this.get(json, obj, 'stroke', undefined);
                this.get(json, obj, 'strokeWidth', undefined);
                break;
            case 'Button':
                json.ss = obj._spriteSheet.originName || obj._spriteSheet;
        }
    },

    get: function(json, obj, key, val) {
        if (obj[key] !== val) {
            json[key] = obj[key];
        }
    },

    set: function(json, obj, key) {
        if (json[key] !== undefined) {
            obj.style(key, json[key]);
        }
    }
    
});

return Viewer;
});