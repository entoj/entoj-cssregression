'use strict';

/**
 * Requirements
 * @ignore
 */
const Test = require('entoj-system').model.test.Test;


/**
 * Describes a CSS Regression Test
 *
 * @memberOf model.site
 */
class CssRegressionTest extends Test
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.test/CssRegressionTest';
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CssRegressionTest = CssRegressionTest;
