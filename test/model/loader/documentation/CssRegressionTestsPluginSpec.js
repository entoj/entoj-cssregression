/**
 * Requirements
 */
const CssRegressionTestsPlugin = require(CSSREGRESSION_SOURCE + '/model/loader/documentation/CssRegressionTestsPlugin.js').CssRegressionTestsPlugin;
const CssRegressionConfiguration = require(CSSREGRESSION_SOURCE + '/configuration/CssRegressionConfiguration.js').CssRegressionConfiguration;
const projectFixture = require('entoj-system/test').fixture.project;
const loaderPluginSpec = require('entoj-system/test').model.loader.LoaderPluginShared;
const co = require('co');


/**
 * Spec
 */
describe(CssRegressionTestsPlugin.className, function()
{
    /**
     * LoaderPlugin Test
     */
    loaderPluginSpec(CssRegressionTestsPlugin, 'model.loader.documentation/CssRegressionTestsPlugin', function(params)
    {
        params.unshift(global.fixtures.moduleConfig, global.fixtures.pathesConfiguration);
        return params;
    });


    /**
     * PackagePlugin Test
     */
    beforeEach(function()
    {
        global.fixtures = projectFixture.createDynamic();
        global.fixtures.moduleConfig = new CssRegressionConfiguration(global.fixtures.globalConfiguration, global.fixtures.buildConfiguration);
    });

    function createTestee()
    {
        return new CssRegressionTestsPlugin(global.fixtures.moduleConfig, global.fixtures.pathesConfiguration)
    }

    describe('#executeFor()', function()
    {
        it('should add a CssRegressionTest for each configured entity and site', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                yield testee.executeFor(entity);
                yield testee.executeFor(entity, entity.usedBy[0]);
                //const test = item.tests.getFirstByType(CssRegressionTest);
                //console.log('Loaded', entity.tests);
            });
            return promise;
        });
    });
});
