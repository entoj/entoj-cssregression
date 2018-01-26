/**
 * Requirements
 */
const CssRegressionTestsPlugin = require(CSSREGRESSION_SOURCE + '/model/loader/documentation/CssRegressionTestsPlugin.js').CssRegressionTestsPlugin;
const CssRegressionConfiguration = require(CSSREGRESSION_SOURCE + '/configuration/CssRegressionConfiguration.js').CssRegressionConfiguration;
const CssRegressionTestSuite = require(CSSREGRESSION_SOURCE + '/model/test/CssRegressionTestSuite.js').CssRegressionTestSuite;
const CssRegressionTestCase = require(CSSREGRESSION_SOURCE + '/model/test/CssRegressionTestCase.js').CssRegressionTestCase;
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
     * CssRegressionTestsPlugin Test
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
        it('should add a CssRegressionTestSuite for each configured entity and site', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                yield testee.executeFor(entity);
                yield testee.executeFor(entity, entity.usedBy[0]);
                const tests = entity.testSuites.getByType(CssRegressionTestSuite);
                expect(tests).to.have.length(2);
            });
            return promise;
        });

        it('should create a CssRegressionTestCase for each viewport width', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                yield testee.executeFor(entity);
                const testSuite = entity.testSuites.getFirstByType(CssRegressionTestSuite);
                expect(testSuite.tests).to.have.length(8);
                for (const testCase of testSuite.tests)
                {
                    expect(testCase).to.be.instanceof(CssRegressionTestCase);
                }
            });
            return promise;
        });

        it('should generate a name from the given url', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                yield testee.executeFor(entity);
                const testSuite = entity.testSuites.getFirstByType(CssRegressionTestSuite);
                for (const testCase of testSuite.tests)
                {
                    expect(testCase.referenceImagePath).to.match(/overview-|other-/);
                }
            });
            return promise;
        });

        it('should add ?static to all urls', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                yield testee.executeFor(entity);
                const testSuite = entity.testSuites.getFirstByType(CssRegressionTestSuite);
                for (const testCase of testSuite.tests)
                {
                    expect(testCase.url).to.match(/\?static/);
                }
            });
            return promise;
        });

        it('should allow to customize the viewport widths per test', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                entity.properties.merge(
                    {
                        base:
                        {
                            test:
                            {
                                cssregression:
                                [
                                    {
                                        viewportWidths:[100]
                                    },
                                    {
                                        viewportWidths:[100]
                                    }
                                ]
                            }
                        }
                    });
                yield testee.executeFor(entity);
                const testSuite = entity.testSuites.getFirstByType(CssRegressionTestSuite);
                expect(testSuite.tests).to.have.length(2);
                for (const testCase of testSuite.tests)
                {
                    expect(testCase.referenceImagePath).to.match(/@100/);
                }
            });
            return promise;
        });

        it('should allow to specify a test name', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                entity.properties.merge(
                    {
                        base:
                        {
                            test:
                            {
                                cssregression:
                                [
                                    {
                                        name: 'foo'
                                    },
                                    {
                                        name: 'bar'
                                    }
                                ]
                            }
                        }
                    });
                yield testee.executeFor(entity);
                const testSuite = entity.testSuites.getFirstByType(CssRegressionTestSuite);
                for (const testCase of testSuite.tests)
                {
                    expect(testCase.referenceImagePath).to.match(/foo-|bar-/);
                }
            });
            return promise;
        });
    });
});
