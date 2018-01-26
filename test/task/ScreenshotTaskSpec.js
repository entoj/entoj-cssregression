'use strict';

/**
 * Requirements
 */
const ScreenshotTask = require(CSSREGRESSION_SOURCE + '/task/ScreenshotTask.js').ScreenshotTask;
const CssRegressionConfiguration = require(CSSREGRESSION_SOURCE + '/configuration/CssRegressionConfiguration.js').CssRegressionConfiguration;
const CssRegressionTestSuite = require(CSSREGRESSION_SOURCE + '/model/test/CssRegressionTestSuite.js').CssRegressionTestSuite;
const CssRegressionTestCase = require(CSSREGRESSION_SOURCE + '/model/test/CssRegressionTestCase.js').CssRegressionTestCase;
const TestServer = require(CSSREGRESSION_TEST + '/TestServer.js').TestServer;
const projectFixture = require('entoj-system/test').fixture.project;
const entitiesTaskSpec = require('entoj-system/test').task.EntitiesTaskShared;
const VinylFile = require('vinyl');
const co = require('co');
const path = require('path');
const fs = require('co-fs-extra');


/**
 * Spec
 */
describe(ScreenshotTask.className, function()
{
    /**
     * EntitiesTask Test
     */
    entitiesTaskSpec(ScreenshotTask, 'task/ScreenshotTask', function()
    {
        const fixture = projectFixture.createStatic();
        const moduleConfiguration = new CssRegressionConfiguration(fixture.globalConfiguration, fixture.buildConfiguration);
        return [fixture.cliLogger, fixture.globalRepository, fixture.pathesConfiguration, moduleConfiguration];
    });


    /**
     * ScreenshotTask Test
     */
    beforeEach(function()
    {
        const promise = co(function*()
        {
            yield fs.emptyDir(path.join(CSSREGRESSION_FIXTURES, 'temp'));
        });
        return promise;
    });

    // creates a initialized testee
    const createTestee = function(settings)
    {
        global.fixtures = projectFixture.createStatic({ settings: settings });
        const moduleConfiguration = new CssRegressionConfiguration(global.fixtures.globalConfiguration, global.fixtures.buildConfiguration);
        return new ScreenshotTask(global.fixtures.cliLogger, global.fixtures.globalRepository, global.fixtures.pathesConfiguration, moduleConfiguration);
    };

    // creates a test suite
    const createTestSuite = function(entity)
    {
        const testSuite = new CssRegressionTestSuite(
            {
                name: 'cssregression',
                site: entity.id.site
            });
        entity.testSuites.push(testSuite);
        const testCase1 = new CssRegressionTestCase(
            {
                name: 'overview',
                url: 'http://localhost:8100/overview',
                viewportWidth: 100,
                referenceImagePath: path.join(CSSREGRESSION_FIXTURES, 'temp/overview-reference.png'),
                testImagePath: path.join(CSSREGRESSION_FIXTURES, 'temp/overview-test.png'),
                differenceImagePath: path.join(CSSREGRESSION_FIXTURES, 'temp/overview-difference.png')
            });
        const testCase2 = new CssRegressionTestCase(
            {
                name: 'details',
                url: 'http://localhost:8100/details',
                viewportWidth: 100,
                referenceImagePath: path.join(CSSREGRESSION_FIXTURES, 'temp/details-reference.png'),
                testImagePath: path.join(CSSREGRESSION_FIXTURES, 'temp/details-test.png'),
                differenceImagePath: path.join(CSSREGRESSION_FIXTURES, 'temp/details-difference.png')
            });
        testSuite.tests.push(testCase1);
        testSuite.tests.push(testCase2);
    };

    describe('#processEntity()', function()
    {
        it('should create a screenshot for each test', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const server = new TestServer().content('boojaahh').start(8100);
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                createTestSuite(entity);
                const result = yield testee.processEntity(entity, global.fixtures.buildConfiguration);
                yield testee.finalize(); // make sure we shut this down gracefully
                server.stop();
                expect(result).to.have.length(4);
                for (const screenshot of result)
                {
                    expect(screenshot).to.be.instanceof(VinylFile);
                }
            });
            return promise;
        });

        it('should only create reference screenshot when they dont exist', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const server = new TestServer().content('boojaahh').start(8100);
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                createTestSuite(entity);
                yield fs.ensureFile(path.join(CSSREGRESSION_FIXTURES, 'temp/overview-reference.png'));
                yield fs.ensureFile(path.join(CSSREGRESSION_FIXTURES, 'temp/details-reference.png'));
                const result = yield testee.processEntity(entity, global.fixtures.buildConfiguration);
                yield testee.finalize(); // make sure we shut this down gracefully
                server.stop();
                expect(result).to.have.length(2);
                for (const screenshot of result)
                {
                    expect(screenshot.path).to.match(/-test/);
                }
            });
            return promise;
        });

        it('should always create test screenshots', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const server = new TestServer().content('boojaahh').start(8100);
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                createTestSuite(entity);
                yield fs.ensureFile(path.join(CSSREGRESSION_FIXTURES, 'temp/overview-reference.png'));
                yield fs.ensureFile(path.join(CSSREGRESSION_FIXTURES, 'temp/overview-test.png'));
                yield fs.ensureFile(path.join(CSSREGRESSION_FIXTURES, 'temp/details-reference.png'));
                yield fs.ensureFile(path.join(CSSREGRESSION_FIXTURES, 'temp/details-test.png'));
                const result = yield testee.processEntity(entity, global.fixtures.buildConfiguration);
                yield testee.finalize(); // make sure we shut this down gracefully
                server.stop();
                expect(result).to.have.length(2);
                for (const screenshot of result)
                {
                    expect(screenshot.path).to.match(/-test/);
                }
            });
            return promise;
        });
    });
});
