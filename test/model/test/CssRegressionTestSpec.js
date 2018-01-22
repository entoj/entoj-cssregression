'use strict';

/**
 * Requirements
 */
const CssRegressionTest = require(CSSREGRESSION_SOURCE + '/model/test/CssRegressionTest.js').CssRegressionTest;
const testSpec = require('entoj-system/test').model.test.TestShared;


/**
 * Spec
 */
describe(CssRegressionTest.className, function()
{
    /**
     * Test Test
     */
    testSpec(CssRegressionTest, 'model.test/CssRegressionTest');
});
