'use strict';

/**
 * Requirements
 */
const CompareTask = require(CSSREGRESSION_SOURCE + '/task/CompareTask.js').CompareTask;
const CssRegressionConfiguration = require(CSSREGRESSION_SOURCE + '/configuration/CssRegressionConfiguration.js').CssRegressionConfiguration;
const CssRegressionTestSuite = require(CSSREGRESSION_SOURCE + '/model/test/CssRegressionTestSuite.js').CssRegressionTestSuite;
const CssRegressionTestCase = require(CSSREGRESSION_SOURCE + '/model/test/CssRegressionTestCase.js').CssRegressionTestCase;
const VinylFile = require('vinyl');
const projectFixture = require('entoj-system/test').fixture.project;
const entitiesTaskSpec = require('entoj-system/test').task.EntitiesTaskShared;
const co = require('co');
const path = require('path');
const fs = require('co-fs-extra');


/**
 * Spec
 */
describe(CompareTask.className, function()
{
    /**
     * EntitiesTask Test
     */
    entitiesTaskSpec(CompareTask, 'task/CompareTask', function()
    {
        const fixture = projectFixture.createStatic();
        const moduleConfiguration = new CssRegressionConfiguration(fixture.globalConfiguration, fixture.buildConfiguration);
        return [fixture.cliLogger, fixture.globalRepository, moduleConfiguration];
    });


    /**
     * CompareTask Test
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
        return new CompareTask(global.fixtures.cliLogger, global.fixtures.globalRepository, moduleConfiguration);
    };

    // creates a test suite
    const createTestSuite = function(entity, hasChanges)
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
                referenceImagePath: path.join(CSSREGRESSION_FIXTURES, 'images/screenshot.png'),
                testImagePath: path.join(CSSREGRESSION_FIXTURES, 'images/screenshot' + (hasChanges ? '-changed' : '') + '.png'),
                differenceImagePath: path.join(CSSREGRESSION_FIXTURES, 'temp/screenshot-difference.png')
            });
        testSuite.tests.push(testCase1);
        return testSuite;
    };

    describe('#processEntity()', function()
    {
        it('should create a difference for each test', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                createTestSuite(entity, true);
                const result = yield testee.processEntity(entity, global.fixtures.buildConfiguration);
                expect(result).to.have.length(1);
                for (const screenshot of result)
                {
                    expect(screenshot).to.be.instanceof(VinylFile);
                }
            });
            return promise;
        });

        it('should update the TestSuite with failed tests', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                const testSuite = createTestSuite(entity, true);
                yield testee.processEntity(entity, global.fixtures.buildConfiguration);
                expect(testSuite.ok).to.be.equal(0);
                expect(testSuite.failed).to.be.equal(1);
                expect(testSuite.isValid).to.be.not.ok;
                expect(testSuite.tests[0].isValid).to.be.not.ok;
            });
            return promise;
        });

        it('should update the TestSuite with succesfull tests', function()
        {
            const promise = co(function*()
            {
                const testee = createTestee();
                const entity = yield global.fixtures.entitiesRepository.getById('m-teaser');
                const testSuite = createTestSuite(entity, false);
                yield testee.processEntity(entity, global.fixtures.buildConfiguration);
                expect(testSuite.ok).to.be.equal(1);
                expect(testSuite.failed).to.be.equal(0);
                expect(testSuite.isValid).to.be.ok;
                expect(testSuite.tests[0].isValid).to.be.ok;
            });
            return promise;
        });
    });
});
