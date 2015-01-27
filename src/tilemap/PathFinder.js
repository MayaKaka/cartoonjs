
define( function ( require, exports, module ) {
	"use strict";
	
// javascript-astar 0.2.0
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.
// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html

var Class = require('core/Class');

var astar = {
    init: function(grid) {
        for(var x = 0, xl = grid.length; x < xl; x++) {
            for(var y = 0, yl = grid[x].length; y < yl; y++) {
                var node = grid[x][y];
                node.f = 0;
                node.g = 0;
                node.h = 0;
                node.cost = node.type;
                node.visited = false;
                node.closed = false;
                node.parent = null;
            }
        }
    },
    heap: function() {
        return new BinaryHeap(function(node) {
            return node.f;
        });
    },

    // astar.search
    // supported options:
    // {
    //   heuristic: heuristic function to use
    //   diagonal: boolean specifying whether diagonal moves are allowed
    // }
    search: function(grid, start, end, options) {
        astar.init(grid);

        options = options || {};
        var heuristic = options.heuristic || astar.manhattan;
        var diagonal = !!options.diagonal;
        var costDiagonal = options.costDiagonal || 1;
        var costStraight = options.costStraight || 1;

        var openHeap = astar.heap();

        openHeap.push(start);

        while(openHeap.size() > 0) {

            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();

            // End case -- result has been found, return the traced path.
            if(currentNode === end) {
                var curr = currentNode;
                var ret = [];
                while(curr.parent) {
                    ret.push(curr);
                    curr = curr.parent;
                }
                return ret.reverse();
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;

            // Find all neighbors for the current node. Optionally find diagonal neighbors as well (false by default).
            var neighbors = astar.neighbors(grid, currentNode, diagonal);

            for(var i=0, il = neighbors.length; i < il; i++) {
                var neighbor = neighbors[i];

                if(neighbor.closed || neighbor.isWall()) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }

                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentNode.g + neighbor.cost;
                var beenVisited = neighbor.visited;

                if(!beenVisited || gScore < neighbor.g) {

                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic(neighbor.pos, end.pos, costStraight, costDiagonal);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                    }
                    else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }

        // No result was found - empty array signifies failure to find path.
        return [];
    },
    manhattan: function(pos0, pos1) {
        // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

        var d1 = Math.abs (pos1.x - pos0.x);
        var d2 = Math.abs (pos1.y - pos0.y);
        return d1 + d2;
    },
    diagonal: function(pos0, pos1, D, D2) {
      var d1 = Math.abs (pos1.x - pos0.x);
      var d2 = Math.abs (pos1.y - pos0.y);
      return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
    },
    neighbors: function(grid, node, diagonals) {
        var ret = [];
        var x = node.x;
        var y = node.y;

        // West
        if(grid[x-1] && grid[x-1][y]) {
            ret.push(grid[x-1][y]);
            grid[x-1][y].cost = 1;
        }

        // East
        if(grid[x+1] && grid[x+1][y]) {
            ret.push(grid[x+1][y]);
            grid[x+1][y].cost = 1;
        }

        // South
        if(grid[x] && grid[x][y-1]) {
            ret.push(grid[x][y-1]);
            grid[x][y-1].cost = 1;
        }

        // North
        if(grid[x] && grid[x][y+1]) {
            ret.push(grid[x][y+1]);
            grid[x][y+1].cost = 1;
        }

        if (diagonals) {

            // Southwest
            if(grid[x-1] && grid[x-1][y-1]) {
                ret.push(grid[x-1][y-1]);
                grid[x-1][y-1].cost = Math.SQRT2;
            }

            // Southeast
            if(grid[x+1] && grid[x+1][y-1]) {
                ret.push(grid[x+1][y-1]);
                grid[x+1][y-1].cost = Math.SQRT2;
            }

            // Northwest
            if(grid[x-1] && grid[x-1][y+1]) {
                ret.push(grid[x-1][y+1]);
                grid[x-1][y+1].cost = Math.SQRT2;
            }

            // Northeast
            if(grid[x+1] && grid[x+1][y+1]) {
                ret.push(grid[x+1][y+1]);
                grid[x+1][y+1].cost = Math.SQRT2;
            }

        }

        return ret;
    }
};

function Graph(grid) {
    var nodes = [];

    for (var x = 0; x < grid.length; x++) {
        nodes[x] = [];

        for (var y = 0, row = grid[x]; y < row.length; y++) {
            nodes[x][y] = new GraphNode(x, y, row[y]);
        }
    }

    this.input = grid;
    this.nodes = nodes;
}

Graph.prototype.toString = function() {
    var graphString = "\n";
    var nodes = this.nodes;
    var rowDebug, row, y, l;
    for (var x = 0, len = nodes.length; x < len; x++) {
        rowDebug = "";
        row = nodes[x];
        for (y = 0, l = row.length; y < l; y++) {
            rowDebug += row[y].type + " ";
        }
        graphString = graphString + rowDebug + "\n";
    }
    return graphString;
};

function GraphNode(x,y,type) {
    this.data = { };
    this.x = x;
    this.y = y;
    this.pos = {
        x: x,
        y: y
    };
    this.type = type;
}

GraphNode.prototype.toString = function() {
    return "[" + this.x + " " + this.y + "]";
};

GraphNode.prototype.isWall = function() {
    return this.type === 0;
};

function BinaryHeap(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
    push: function(element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    },
    pop: function() {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    },
    remove: function(node) {
        var i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            }
            else {
                this.bubbleUp(i);
            }
        }
    },
    size: function() {
        return this.content.length;
    },
    rescoreElement: function(node) {
        this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1,
                parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }

            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    },
    bubbleUp: function(n) {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);

        while(true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1, child1N = child2N - 1;
            // This is used to store the new position of the element,
            // if any.
            var swap = null;
            var child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore){
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }

            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
};

var PathFinder = Class.extend({
	
	graph: null,
	_startNode: null,
	_endNode: null,
	
	init: function(data) {
		this.graph = new Graph(data);		
	},
	
	setStartNode: function(x, y){
		this._startNode = this.graph.nodes[x][y];
	},
	
	setEndNode: function(x, y){
		this._endNode = this.graph.nodes[x][y];
	},
	
    getAPath: function() {
        return astar.search(this.graph.nodes, this._startNode, this._endNode, { diagonal: false }); 
    },

	getPath: function() {
		var result = [];
		
		if (this._endNode === this._startNode) return result;
		
		// 当终点不可行时，寻找最近可行点
		if (this._endNode.isWall()) {
			// cc.log('No Path~~~');
			var nearest = this.getNearest(this._startNode, this._endNode);
			if (nearest && nearest!==this._startNode) {
				this.setEndNode(nearest.x, nearest.y);
			} else {
				return result;
			}
		}
		// 当终点与起始点可直接连接时，走直接路径
		if (this.isLink(this._startNode, this._endNode)) {
			// cc.log('Direct Path~~~');
			result.push(this._endNode);
			return result;
		}
		// 当终点与起始点无法连接时，走 A星路径
		var path = astar.search(this.graph.nodes, this._startNode, this._endNode, { diagonal: true });		
			
		if (path.length > 1) {
			path.unshift(this._startNode);
			// 加入起始点后，长度至少为3，进行优化处理
			var lastDir = this.getDirection(path[0], path[1]), 
				newDir = -1;
			// 只保留方向不同的点
			for (var i=1, l=path.length-1; i<l; i++) {	
				newDir = this.getDirection(path[i], path[i+1]);
				if (newDir !== lastDir) {
					result.push(path[i]);
				}
				lastDir = newDir;
			}
			result.push(path[path.length-1]);
		} else {
			// path 的原始长度为 0 或者 1时，不做优化处理
			result = path;
		}
		
		if (result.length > 1) {
			// 加入起始点后，长度至少为3，进行拐角优化
			result.unshift(this._startNode);
			// 节点优化， 从简处理，并非  flody 算法
			this.flody(result);
			// 移除起始点
			result.shift();
		}
		// cc.log('Astar Path~~~');
		return result;
	},
	
	flody: function(path) {
		var delArr = [];
		// 正方向遍历
		for (var i=0; i<path.length; i++) {
			// 逆方向遍历
			for (var j=path.length-1; j>=i+2; j--) {
				// 当两个节点可以直接联通时，删除中间的多余的节点
				if (this.isLink(path[i], path[j])) {
					// 比如 1 和 4可以直接联通时，删除 2 和 3，然后从4开始寻找新的可连通的点
					// cc.log('link', i, j);
					for (var k=i+1; k<j; k++) {
						delArr.push(k);
					}
					i = j-1;
					break;
				}
			}
		}
		for (var i=delArr.length-1; i>=0; i--) {
			path.splice(delArr[i], 1);
		}
	},
	
	pathToString: function(path){
		var str = "(";
		for (var i=0;i<path.length;i++) {
			if (i>0) {
				str += "|";
			}
			str += "("+path[i].x+"|"+path[i].y+")";
		}
		str += ")";
		return str;
	},
	
	pathToArray: function(str) {
		var len = str.length;
		str = str.substring(0, len-2);
		str = str.substring(2, str.length);
		var arr = str.split(")|("),
			path = [], x, y;
		for (var i=0;i<arr.length;i++) {
			x = arr[i].split("|")[0];
			y = arr[i].split("|")[1];
			path.push(this.graph.nodes[parseInt(x)][parseInt(y)]);
		}
		return path;
	},
	
    isWall: function(x, y) {
        return this.graph.nodes[x][y].isWall();
    },

	isLink: function(node0, node1){
		var dx = node1.x - node0.x;
		var dy = node1.y - node0.y;
		var dd = Math.sqrt(dx * dx + dy * dy);
		// 计算步长
		var rule = 0.2;
		var kx = dx / dd * rule;
		var ky = dy / dd * rule;
		var count = 0;
		var nodes = this.graph.nodes;
		var x, y, nearest;
		while (dd>0) {
			count++;
			dd -= rule;
			// 循环计算节点走过的路径
			x = Math.floor(node0.x+0.5+count*kx);
			y = Math.floor(node0.y+0.5+count*ky);
			if (nodes[x][y].isWall()) {
				return false;
			}
		}
		return true;
	},
	
	getNearest: function(node0, node1){
		var neighbors = astar.neighbors(this.graph.nodes, node1, true);
		var distance = -1, node = null, o = this, shortdis = -1;
		neighbors.forEach(function(a, i){
			if (!a.isWall()) {
				distance = o.getDistance(node0, a);
				if (shortdis < 0 || distance < shortdis) {
					shortdis = distance;
					node = a;
				}
			}
		});
		return node;
	},
	
	getDistance: function(p0, p1){
		return Math.sqrt((p1.x-p0.x)*(p1.x-p0.x) + (p1.y-p0.y)*(p1.y-p0.y));
	},
	
	getDirection: function(p0, p1) {
		if (p1.x > p0.x) {
			if (p1.y > p0.y) {
				return 0;
			} else if(p1.y === p0.y) {
				return 1;
			} else {
				return 2;
			}
		}
		else if (p1.x === p0.x) {
			if (p1.y > p0.y) {
				return 3;
			} else if(p1.y === p0.y) {
				return 4;
			} else {
				return 5;
			}
		}
		else {
			if (p1.y > p0.y) {
				return 6;
			} else if(p1.y === p0.y) {
				return 7;
			} else {
				return 8;
			}
		}
	}
});

return PathFinder;
});