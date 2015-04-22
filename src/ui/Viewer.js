
define(function (require) {
    'use strict';

var ct = require('cartoon');
    
var Viewer = ct.Class.extend({
    
    _cssPrefix: '',
    _viewIndex: -1,
    _views: null,
    _sprites: null,

    _scriptEnabled: false,

    init: function() {
        this._viewIndex = 0;
        this._views = {};
        this._sprites = {};
    },

    useCss: function(prefix) {
        this._cssPrefix = prefix;
    },
 

    isContainer: function(type) {
        return ['Stage', 'Canvas', 'GLCanvas', 'DisplayObject'].indexOf(type) > -1;
    },

    enableScript: function(flag) {
        this._scriptEnabled = flag;
    },

    getSprite: function(name) {
        return this._sprites[name];
    },

    parse: function(json) {
        return this.parseObj(json);
    },

    parseObj: function(json, root) {
        var self = this;

        if (!root) {
            ct.setRenderMode(json.render);
        }

        if (json.x === undefined) json.x = 0;
        if (json.y === undefined) json.y = 0;

        var obj = this.parseDisplayObj(json);

        if (!root) {
            root = obj;
            root._callbacks = [];
        }

        if (json.tag) {
            this.setTag(obj, json.tag);
        }

        if (json.children) {
            json.children.forEach(function(a, i) {
                obj.add(self.parseObj(a, root));
            });
        }

        if (json.script) {
            obj.script = json.script;
            if (this._scriptEnabled) {
                root._callbacks.push(obj);
            }
        }

        if (root === obj) {
            this.callback(root._callbacks);
            root._callbacks = null;
        }

        return obj;
    },

    parseDisplayObj: function(json) {
        var obj;
        switch(json.type) {
            case 'Stage':
                obj = new ct.Stage(json);
                break;
            case 'Canvas':
                obj = new ct.Canvas(json);
                break;
            case 'DisplayObject':
                obj = new ct.DisplayObject(json);
                break;
            case 'Bitmap':
                obj = new ct.Bitmap(json);
                break;
            case 'Text':
                obj = new ct.Text(json);
                break;
            case 'Sprite':
                obj = new ct.Sprite(json);
                obj.play('all');
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
            case 'TextField':
                obj = new ct.TextField(json);
                break;
            case 'ParticleSystem':
                obj = new ct.DisplayObject(json);
                break;
        }
        return obj;
    },

    json: function(obj) {
        return this.jsonObj(obj);
    },

    jsonObj: function(obj, root) {
        var self = this;

        var json = {
            type: obj.type
        }

        if (!root) {
            root = obj;
            json.render = obj.renderMode;
        }
        
        if (obj.tag) json.tag = obj.tag;

        this.getProp(json, obj, 'x', 0);
        this.getProp(json, obj, 'y', 0);
        this.getProp(json, obj, 'width', 0);
        this.getProp(json, obj, 'height', 0);
        this.getProp(json, obj, 'alpha', 1);
        this.getProp(json, obj, 'visible', true);
        this.getProp(json, obj, 'cursor', 'auto');

        this.jsonDisplayObj(json, obj);

        var isContainer = this.isContainer(obj.type);
        if (isContainer && obj.children.length) {
            json.children = [];
            obj.children.forEach(function(a, i) {
                json.children.push(self.jsonObj(a, root));
            });
        }

        if (obj.script) json.script = obj.script;
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
                this.getProp(json, obj, 'fill', undefined);
                this.getProp(json, obj, 'stroke', undefined);
                this.getProp(json, obj, 'strokeWidth', undefined);
                break;
            case 'Circle':
                this.getProp(json, obj, 'radius', undefined);
                this.getProp(json, obj, 'fill', undefined);
                this.getProp(json, obj, 'stroke', undefined);
                this.getProp(json, obj, 'strokeWidth', undefined);
                break;
            case 'Button':
                json.ss = obj._spriteSheet.originName || obj._spriteSheet;
                break;
            case 'TextField':
                json.size = obj.fontSize;
                break;
        }
    },

    jsonTree: function(obj, root) {
        var self = this;
        var isContainer = this.isContainer(obj.type);
        var pid = obj.pid = ++this._viewIndex;    

        this.set(pid, obj);

        var tree = {
            name: this.getName(obj),
            drag: !root && !obj.renderMode,
            pid: pid,
            isParent: isContainer
        };

        if (isContainer) {
            tree.children = [];
            obj.children.forEach(function(a, i) {
                tree.children.push(self.jsonTree(a));
            });
        }

        return tree;
    },

    getProp: function(json, obj, key, val) {
        if (obj[key] !== val) {
            json[key] = obj[key];
        }
    },

    set: function(tag, obj) {
        this._views[tag] = obj;
    },

    getName: function(obj) {
        var type = obj.type === 'DisplayObject' ? 'Display' : obj.type === 'ParticleSystem' ? 'Particle' : obj.type;
        var tag = obj.tag ? ' 【'+obj.tag+'】' : '';
        var script = obj.script ? ' Θ' : '';
        var hidden = obj.visible ? '' : ' × ';
        return hidden + type + tag + script;
    },

    get: function(tag) {
        return this._views[tag];
    },

    setTag: function(obj, tag) {
        obj.tag = tag;

        this.set(tag, obj);

        if (obj.tag && obj.renderMode === 0) {
            obj.elem.className = (this._cssPrefix + obj.tag).replace(/_/g, '-');
        }
    },

    callback: function(objects) {
        var viewer = this;
        var V = function(tag) {
            return viewer.get(tag);
        };
        var _this = viewer._this;
        
        objects.forEach(function(a, i) {
            eval('(function(){'+a.script+'}).call(a)');
        });
    }
    
});

return Viewer;
});