var sinon = require('sinon');
var basepath = require('../../middleware/basepath');

describe('Basepath middleware', function() {
	var path = '/some/path', context, next, redirect;
	beforeEach(function() {
		redirect = sinon.spy();
		next = sinon.spy();
		context = {
			path: path,
			redirect: redirect
		};
	});

	describe('without a basepath', function() {
		before(function() {
			global.BASEPATH = '';
		});

		beforeEach(function *() {
			yield basepath.call(context, function(cb) {next(); cb();});
		});

		it('should continue execution', function() {
			next.called.must.be.true();
		});

		it('should call redirect with the full path and alt', function() {
			context.redirect('/some/other/path', 'some-alt');

			redirect.calledOnce.must.be.true();
			redirect.calledWith('/some/other/path', 'some-alt').must.be.true();
			redirect.calledOn(context).must.be.true();
		});

		it('should not alter the path', function() {
			context.path.must.be(path);
		});
	});

	describe('with a basepath', function() {
		before(function() {
			global.BASEPATH = '/some';
		});

		it('should throw a 404 if we have a path without the base', function *() {
			context.path = '/path';
			yield basepath.call(context, function(cb) {next(); cb();});
		});

		describe('with a proper path', function() {
			beforeEach(function *() {
				yield basepath.call(context, function(cb) {next(); cb();});
			});

			it('should continue execution', function() {
				next.called.must.be.true();
			});

			it('should call redirect with the correct path and alt', function() {
				context.redirect('/other/path', 'some-alt');

				redirect.calledOnce.must.be.true();
				redirect.calledWith('/some/other/path', 'some-alt').must.be.true();
				redirect.calledOn(context).must.be.true();
			});

			it('should set the path correctly', function() {
				context.path.must.be('/path');
			});

			it('should set the originalpath correctly', function() {
				context.originalpath.must.be('/some/path');
			});
		});
	});
});