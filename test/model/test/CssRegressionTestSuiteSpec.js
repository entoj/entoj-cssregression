'use strict';

/**
 * Requirements
 */
const CssRegressionTestSuite = require(CSSREGRESSION_SOURCE + '/model/test/CssRegressionTestSuite.js').CssRegressionTestSuite;
const testSuiteSpec = require('entoj-system/test').model.test.TestSuiteShared;


/**
 * Spec
 */
describe(CssRegressionTestSuite.className, function()
{
    /**
     * Test TestSuite
     */
    testSuiteSpec(CssRegressionTestSuite, 'model.test/CssRegressionTestSuite');
});
