function matrix(a, b, equal) {
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

function distance(m) {
	return m[m.length-1][m[m.length-1].length-1];
}

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

module.exports = {
	matrix: matrix,
	distance: distance,
	diff: diff
};