'use strict';

/**
 * Requirements
 */
const ScreenshotTask = require(CSSREGRESSION_SOURCE + '/task/ScreenshotTask.js').ScreenshotTask;
const CssRegressionConfiguration = require(CSSREGRESSION_SOURCE + '/configuration/CssRegressionConfiguration.js').CssRegressionConfiguration;
const TestServer = require(CSSREGRESSION_TEST + '/TestServer.js').TestServer;
const projectFixture = require('entoj-system/test').fixture.project;
const entitiesTaskSpec = require('entoj-system/test').task.EntitiesTaskShared;
const VinylFile = require('vinyl');
const co = require('co');


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
        global.fixtures = projectFixture.createDynamic();
    });

    // creates a initialized testee
    const createTestee = function()
    {
        const fixture = projectFixture.createStatic();
        const moduleConfiguration = new CssRegressionConfiguration(fixture.globalConfiguration, fixture.buildConfiguration);
        return new ScreenshotTask(global.fixtures.cliLogger, global.fixtures.globalRepository, fixture.pathesConfiguration, moduleConfiguration);
    };

    describe('#renderEntity()', function()
    {
        it('should return a promise', function()
        {
            const testee = createTestee();
            const promise = testee.renderEntity();
            expect(promise).to.be.instanceof(Promise);
            return promise;
        });

        it('should create a screenshot file for each viewport width', function()
        {
            const promise = co(function*()
            {
                const server = new TestServer().content('boojaahh').start(8100);
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                const result = yield testee.renderEntity(entity, {}, global.fixtures.buildConfiguration,
                    {
                        screenshotServerBaseUrl: 'http://localhost:8100',
                    });
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

        it('should allow to customize the used viewport widths', function()
        {
            const promise = co(function*()
            {
                const server = new TestServer().content('boojaahh').start(8100);
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                const result = yield testee.renderEntity(entity, {}, global.fixtures.buildConfiguration,
                    {
                        screenshotServerBaseUrl: 'http://localhost:8100',
                        screenshotViewportWidths: [300, 600]
                    });
                yield testee.finalize(); // make sure we shut this down gracefully
                server.stop();
                expect(result).to.have.length(2);
                for (const screenshot of result)
                {
                    expect(screenshot.path).to.match(/@300|@600/);
                }
            });
            return promise;
        });

        it('should generate a name form the given url', function()
        {
            const promise = co(function*()
            {
                const server = new TestServer().content('boojaahh').start(8100);
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                const result = yield testee.renderEntity(entity,
                    {
                        url: 'wherver/whatever.j2'
                    },
                    global.fixtures.buildConfiguration,
                    {
                        screenshotServerBaseUrl: 'http://localhost:8100',
                        screenshotViewportWidths: [300]
                    });
                yield testee.finalize(); // make sure we shut this down gracefully
                server.stop();
                expect(result).to.have.length(1);
                for (const screenshot of result)
                {
                    expect(screenshot.path).to.contain('-whatever');
                }
            });
            return promise;
        });

        it('should allow to specify a test name', function()
        {
            const promise = co(function*()
            {
                const server = new TestServer().content('boojaahh').start(8100);
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                const result = yield testee.renderEntity(entity,
                    {
                        name: 'CATS'
                    },
                    global.fixtures.buildConfiguration,
                    {
                        screenshotServerBaseUrl: 'http://localhost:8100',
                        screenshotViewportWidths: [300]
                    });
                yield testee.finalize(); // make sure we shut this down gracefully
                server.stop();
                expect(result).to.have.length(1);
                for (const screenshot of result)
                {
                    expect(screenshot.path).to.contain('CATS');
                }
            });
            return promise;
        });

        it('should allow to specify test viewport sizes', function()
        {
            const promise = co(function*()
            {
                const server = new TestServer().content('boojaahh').start(8100);
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                const result = yield testee.renderEntity(entity,
                    {
                        viewportWidths: [300]
                    },
                    global.fixtures.buildConfiguration,
                    {
                        screenshotServerBaseUrl: 'http://localhost:8100',
                        screenshotViewportWidths: [300]
                    });
                yield testee.finalize(); // make sure we shut this down gracefully
                server.stop();
                expect(result).to.have.length(1);
                for (const screenshot of result)
                {
                    expect(screenshot.path).to.contain('@300');
                }
            });
            return promise;
        });

        it('should allow to customize the generated filenames', function()
        {
            const promise = co(function*()
            {
                const server = new TestServer().content('boojaahh').start(8100);
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                const result = yield testee.renderEntity(entity, {},
                    global.fixtures.buildConfiguration,
                    {
                        screenshotServerBaseUrl: 'http://localhost:8100',
                        screenshotFilenameTemplate: 'CHECK-${name}@${width}.png',
                        screenshotViewportWidths: [300]
                    });
                yield testee.finalize(); // make sure we shut this down gracefully
                server.stop();
                expect(result).to.have.length(1);
                for (const screenshot of result)
                {
                    expect(screenshot.path).to.contain('CHECK-');
                }
            });
            return promise;
        });

        it('should add static=true to all urls', function()
        {
            const promise = co(function*()
            {
                const server = new TestServer().content('boojaahh').start(8100);
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                yield testee.renderEntity(entity, {}, global.fixtures.buildConfiguration,
                    {
                        screenshotServerBaseUrl: 'http://localhost:8100',
                        screenshotViewportWidths: [300]
                    });
                yield testee.finalize(); // make sure we shut this down gracefully
                server.stop();
                expect(server.requests).to.have.length(1);
                for (const request of server.requests)
                {
                    expect(request).to.contain('static=true');
                }
            });
            return promise;
        });
    });


    describe('#processEntity()', function()
    {
        it('should create a screenshots for each configured test', function()
        {
            const promise = co(function*()
            {
                const server = new TestServer().content('boojaahh').start(8100);
                const testee = createTestee();
                const site = yield global.fixtures.sitesRepository.findBy({ '*' : 'Base' });
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser', site);
                const result = yield testee.processEntity(entity, global.fixtures.buildConfiguration,
                    {
                        screenshotServerBaseUrl: 'http://localhost:8100'
                    });
                yield testee.finalize(); // make sure we shut this down gracefully
                server.stop();
                expect(result).to.have.length(8);
                for (const screenshot of result)
                {
                    expect(screenshot.path).to.match(/-overview|-other/);
                }
                expect(server.requests).to.have.length(8);
            });
            return promise;
        });
    });
});
