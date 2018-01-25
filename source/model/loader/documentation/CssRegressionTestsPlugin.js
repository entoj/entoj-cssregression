'use strict';

/**
 * Requirements
 * @ignore
 */
const LoaderPlugin = require('entoj-system').model.loader.LoaderPlugin;
const PathesConfiguration = require('entoj-system').model.configuration.PathesConfiguration;
const EntityAspect = require('entoj-system').model.entity.EntityAspect;
const CssRegressionConfiguration = require('../../../configuration/CssRegressionConfiguration.js').CssRegressionConfiguration;
const CssRegressionTest = require('../../test/CssRegressionTest.js').CssRegressionTest;
const assertParameter = require('entoj-system').utils.assert.assertParameter;
const co = require('co');
const fs = require('fs');


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
                let test = item.tests.findBy(
                    {
                        'name': 'cssregression',
                        site: itemSite
                    });
                if (!test)
                {
                    scope.logger.info('Creating new test for ' + item.pathString);
                    test = new CssRegressionTest();
                    test.name = 'cssregression';
                    test.site = itemSite;
                    item.tests.push(test);
                }
                else
                {
                    scope.logger.info('Updating existing test for ' + item.pathString);
                }
                const data =
                {
                    entityId: item.id,
                    entityCategory: item.id.category,
                    site: itemSite
                };
                const stateFile = yield scope.pathesConfiguration.resolve(scope.moduleConfiguration.testDataTemplate, data);
                if (fs.existsSync(stateFile))
                {
                    const state = JSON.parse(fs.readFileSync(stateFile, { encoding: 'utf8' }));
                    test.total = state.total || 0;
                    test.ok = state.ok || 0;
                    test.failed = state.failed || 0;
                    test.tests = state.tests || [];
                }
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
