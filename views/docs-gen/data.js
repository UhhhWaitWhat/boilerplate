module.exports = function *(pth) {
	pth = '/' + (pth ? pth : '');
	var crumbs = pth.split('/').reduce(function(sum, crumb) {
		if(crumb && crumb.length > 0) {
			sum.push({
				name: crumb,
				path: sum[sum.length-1].path + '/' + crumb,
				last: true
			});
			delete sum[sum.length-1].last;
		}

		return sum;
	}, [{
		name: '/',
		path: this.path,
		last: true
	}]);

	return {
		path: crumbs
	};
};