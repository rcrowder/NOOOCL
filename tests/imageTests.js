var assert = require('assert');
var nooocl = require('../');
var CLHost = nooocl.CLHost;
var _ = require('lodash');
var CLBuffer = nooocl.CLBuffer;
var CLCommandQueue = nooocl.CLCommandQueue;
var CLContext = nooocl.CLContext;
var ref = require('ref');
var testHelpers = require('./testHelpers');
var path = require('path');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var cd = __dirname;
var jpeg = require('jpeg-js');
var CLImage2D = nooocl.CLImage2D;
var NDRange = nooocl.NDRange;

describe('CLImage2D', function() {
    it('should convert an image to grayscale', function(done) {
        done(); return;
        fs.readFileAsync(path.join(cd, 'elefant.jpg')).then(function(data) {
            var inputImage = jpeg.decode(data);
            var host = CLHost.createV11();
            var ctx = testHelpers.createContext(host);
            var context = ctx.context;
            var device = ctx.device;
            var queue = new CLCommandQueue(context, device);
            var format = new (host.cl.types.ImageFormat)({
                imageChannelOrder: host.cl.defs.RGBA,
                imageChannelDataType: host.cl.defs.UNSIGNED_INT8
            });
            var src = CLImage2D.wrap(context, format, inputImage.width, inputImage.height, inputImage.data);
            var dst = new CLImage2D(context, host.cl.defs.MEM_ALLOC_HOST_PTR, format, inputImage.width, inputImage.height);
            return fs.readFileAsync(path.join(cd, 'toGray.cl'), 'utf8').then(
                function(source) {
                    var program = context.createProgram(source);
                    program.build().then(function() {
                        var buildStatus = program.getBuildStatus(device);
                        if (buildStatus < 0) {
                            assert.fail('Build failed.\n' + program.getBuildLog(device));
                        }
                        //var kernel = program.createKernel('toGray');
                        //kernel.setArgs(src, dst);
                        //queue.enqueueNDRangeKernel(true, kernel, new NDRange(inputImage.width, inputImage.height), null, null);
                        //var out = {};
                        //var origin = new NDRange(0,0,0);
                        //var region = new NDRange(inputImage.width, inputImage.height, 1);
                        //return queue.enqueueMapImage(true, dst, host.cl.defs.MAP_READ, origin, region, out).promise
                        //    .then(function() {
                        //    });
                    });
                });
        }).nodeify(done);
    });
});
