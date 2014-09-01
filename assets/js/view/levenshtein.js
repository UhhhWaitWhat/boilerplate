//This file provides methods to calculate the difference between to lists via use of the [Levenshtein Distance](http://en.wikipedia.org/wiki/Levenshtein_distance).
//Calculate a full matrix from two lists, under use of an equality function. This function should return `true` if the elements are equal, `false` otherwise.
function matrix(b, a, equal) {
	var x, y, d = [[0]];
	
	for(x = 1; x < a.length+1; x++) {
		d[x] = [];
		d[x][0] = x;
		for(y = 1; y < b.length+1; y++) {
			d[x][y] = 0;
			d[0][y] = y;
		}
	}

	for(y = 1; y < b.length+1; y++) {
		for(x = 1; x < a.length+1; x++) {
			if(equal(a[x-1], b[y-1])) {
				d[x][y] = d[x-1][y-1];
			} else {
				d[x][y] = Math.min(
					d[x-1][y]+1,
					d[x][y-1]+1,
					d[x-1][y-1]+1
				);
			}
		}
	}

	return d;
}

//Shorthand to retrieve the Levenshtein Distance base on a previously calculated matrix
function distance(m) {
	return m[m.length-1][m[m.length-1].length-1];
}

//This function calculates the steps to take from one list to get the other. You should provide the matrix as well as the target list.
//
//**Example:**
//```
//var from = 'tree'.split('');
//var to = 'freddy'.split('');
//var eq = function(a, b) {return a === b;};
//var matrix = l.matrix(from, to, eq);
//var diff = l.diff(matrix, to);
//```
//*diff:*
//```
//[{ type: ':', value: 'f', position: 0 },
// { type: '=', value: 'r', position: 1 },
// { type: '=', value: 'e', position: 2 },
// { type: '+', value: 'd', position: 3 },
// { type: '+', value: 'd', position: 3 },
// { type: ':', value: 'y', position: 3 } ]
//```
//Types:
//* `:`: Replace
//* `+`: Insert
//* `-`: Remove
//* `=`: Keep
function diff(m, target) {
	var result = [];
	var x = m.length-1;
	var y = m[m.length-1].length-1;
	var left, top, diag;

	while(x !== 0 || y !== 0) {
		diag = x > 0 ? m[x-1][y-1] : undefined;
		left = x > 0 ? m[x-1][y] : undefined;
		top = m[x][y-1];

		if(x > 0 && y > 0 && diag <= left && diag <= top && (diag === m[x][y] || diag === m[x][y]-1)) {
			if(diag !== m[x][y]) {
				result.unshift({type: ':', value: target[x-1], position: y-1});
			} else {
				result.unshift({type: '=', value: target[x-1], position: y-1});
			}

			x = x-1;
			y = y-1;
		} else if((x > 0 && (left <= top || y === 0) && (left === m[x][y] || left === m[x][y]-1)) || y === 0) {
			if(left !== m[x][y]) {
				result.unshift({type: '+', value: target[x-1], position: y});
			} else {
				result.unshift({type: '=', value: target[x-1], position: y-1});
			}

			x = x-1;
		} else {
			if(top !== m[x][y]) {
				result.unshift({type: '-', position: y-1});
			} else {
				result.unshift({type: '=', value: target[x-1], position: y-1});
			}

			y = y-1;
		}
	}

	return result;
}

//Export our functions
module.exports = {
	matrix: matrix,
	distance: distance,
	diff: diff
};