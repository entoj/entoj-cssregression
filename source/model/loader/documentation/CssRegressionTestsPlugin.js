'use strict';

/**
 * Requirements
 * @ignore
 */
const LoaderPlugin = require('entoj-system').model.loader.LoaderPlugin;
const PathesConfiguration = require('entoj-system').model.configuration.PathesConfiguration;
const CssRegressionConfiguration = require('../../../configuration/CssRegressionConfiguration.js').CssRegressionConfiguration;
const CssRegressionTestSuite = require('../../test/CssRegressionTestSuite.js').CssRegressionTestSuite;
const CssRegressionTestCase = require('../../test/CssRegressionTestCase.js').CssRegressionTestCase;
const assertParameter = require('entoj-system').utils.assert.assertParameter;
const co = require('co');
const urls = require('entoj-system').utils.urls;
const path = require('path');
const os = require('os');


/**
 * Loads test results
 */
class CssRegressionTestsPlugin extends LoaderPlugin
{
    /**
     * @param {configuration.CssRegressionConfiguration} moduleConfiguration
     * @param {model.configuration.PathesConfiguration} pathesConfiguration
     * @param {object|undefined} options
     */
    constructor(moduleConfiguration, pathesConfiguration)
    {
        super();

        // Check params
        assertParameter(this, 'moduleConfiguration', moduleConfiguration, true, CssRegressionConfiguration);
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);

        // Assign options
        this._pathesConfiguration = pathesConfiguration;
        this._moduleConfiguration = moduleConfiguration;
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CssRegressionConfiguration, PathesConfiguration] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'model.loader.documentation/CssRegressionTestsPlugin';
    }


    /**
     * @type {model.configuration.PathesConfiguration}
     */
    get pathesConfiguration()
    {
        return this._pathesConfiguration;
    }


    /**
     * @type {configuration.CssRegressionConfiguration}
     */
    get moduleConfiguration()
    {
        return this._moduleConfiguration;
    }


    /**
     * @param {ValueObject} item
     */
    executeFor(item, site)
    {
        const scope = this;
        const promise = co(function*()
        {
            if (!item || !item.id)
            {
                return false;
            }
            const itemSite = site
                ? site
                : item.id.site;
            const settings = item.properties.getByPath(itemSite.name.urlify() + '.test.cssregression', []);
            if (settings.length)
            {
                // Get suite
                let test = item.testSuites.findBy(
                    {
                        name: 'cssregression',
                        site: itemSite
                    });
                if (!test)
                {
                    scope.logger.info('Creating new test for ' + item.pathString);
                    test = new CssRegressionTestSuite();
                    test.name = 'cssregression';
                    test.site = itemSite;
                    item.testSuites.push(test);
                }
                else
                {
                    scope.logger.info('Updating existing test for ' + item.pathString);
                    test.clear();
                }

                for (const setting of settings)
                {
                    const viewportWidths = setting.viewportWidths || scope.moduleConfiguration.viewportWidths;
                    for (const viewportWidth of viewportWidths)
                    {
                        const testCase = new CssRegressionTestCase();
                        const url = setting.url || 'examples/overview.j2';
                        testCase.name = setting.name || path.basename(url, '.j2');
                        testCase.url = '/' + url + '?static=true';
                        testCase.viewportWidth = viewportWidth;
                        const data =
                        {
                            site: site || item.id.site,
                            entityCategory: item.id.category,
                            entityId: item.id,
                            width: viewportWidth,
                            name: testCase.name,
                            os: os.type().toLowerCase()
                        };
                        testCase.referenceImagePath = yield scope.pathesConfiguration.resolve(scope.moduleConfiguration.referenceImageTemplate, data);
                        testCase.testImagePath = yield scope.pathesConfiguration.resolve(scope.moduleConfiguration.testImageTemplate, data);
                        testCase.differenceImagePath = yield scope.pathesConfiguration.resolve(scope.moduleConfiguration.differenceImageTemplate, data);
                        test.tests.push(testCase);
                    }
                }

                //console.log('Creating TestSuite ' + item.pathString, scope.moduleConfiguration, test);
            }

            return true;
        });
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CssRegressionTestsPlugin = CssRegressionTestsPlugin;
