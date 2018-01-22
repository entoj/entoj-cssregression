'use strict';

/**
 * Requirements
 */
const Screenshot = require(CSSREGRESSION_SOURCE + '/utils/Screenshot.js').Screenshot;
const baseSpec = require('entoj-system/test').BaseShared;
const http = require('http');
const co = require('co');


/**
 * Spec
 */
describe(Screenshot.className, function()
{
    /**
     * Base Test
     */
    baseSpec(Screenshot, 'utils/Screenshot');


    /**
     * Screenshot Test
     */
    describe('#create', function()
    {
        it('should return false when url is unreachable', function()
        {
            const promise = co(function*()
            {
                const testee = new Screenshot();
                const buffer = yield testee.create('http://localhost:8100', 200);
                testee.close();
                expect(buffer).to.be.not.ok;
            });
            return promise;
        });

        it('should return a Buffer', function()
        {
            const promise = co(function*()
            {
                const server = http.createServer((req, res) =>
                {
                    res.write('This is sparta');
                    res.end();
                });
                server.listen(8100);
                const testee = new Screenshot();
                const buffer = yield testee.create('http://localhost:8100', 200);
                server.close();
                testee.close();
                expect(buffer).instanceof(Buffer);
            });
            return promise;
        });
    });
});
