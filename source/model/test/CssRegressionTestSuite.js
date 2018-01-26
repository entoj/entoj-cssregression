'use strict';

/**
 * Requirements
 * @ignore
 */
const TestSuite = require('entoj-system').model.test.TestSuite;


/**
 * Describes a CSS Regression Test
 *
 * @memberOf model.site
 */
class CssRegressionTestSuite extends TestSuite
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.test/CssRegressionTestSuite';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CssRegressionTestSuite = CssRegressionTestSuite;
