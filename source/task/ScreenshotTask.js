'use strict';

/**
 * Requirements
 * @ignore
 */
const Screenshot = require('../utils/Screenshot.js').Screenshot;
const EntitiesTask = require('entoj-system').task.EntitiesTask;
const GlobalRepository = require('entoj-system').model.GlobalRepository;
const CliLogger = require('entoj-system').cli.CliLogger;
const ErrorHandler = require('entoj-system').error.ErrorHandler;
const VinylFile = require('vinyl');
const co = require('co');
const fs = require('fs');


/**
 * @memberOf task
 */
class ScreenshotTask extends EntitiesTask
{
    /**
     * @param {cli.CliLogger} cliLogger
     * @param {model.GlobalRepository} globalRepository
     */
    constructor(cliLogger, globalRepository)
    {
        super(cliLogger, globalRepository);

        // Assign options
        this._screenshot = new Screenshot();
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, GlobalRepository] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'task/ScreenshotTask';
    }


    /**
     * @inheritDoc
     */
    get sectionName()
    {
        return 'Creating screenshots';
    }


    /**
     * @type {utils.Screenshot}
     */
    get screenshot()
    {
        return this._screenshot;
    }


    /**
     * @inheritDoc
     */
    prepareParameters(buildConfiguration, parameters)
    {
        const parent = super.prepareParameters(buildConfiguration, parameters);
        const scope = this;
        const promise = co(function*()
        {
            const params = yield parent;
            params.query = params.query || '*';
            params.screenshotServerUrl = params.screenshotServerUrl || 'http://localhost:3000';
            params.screenshotForce = params.screenshotForce || false;
            params.screenshotSkipTest = params.screenshotSkipTest || false;
            return params;
        }).catch(ErrorHandler.handler(scope));
        return promise;
    }


    /**
     * @inheritDoc
     */
    finalize(buildConfiguration, parameters)
    {
        this.screenshot.close();
        return Promise.resolve([]);
    }


    /**
     * @returns {Promise<VinylFile>}
     */
    createScreenshot(entity, width, url, filename)
    {
        const scope = this;
        const promise = co(function*()
        {
            const work = scope.cliLogger.work('Rendering <' + entity.pathString + '>@<' + width + '>');
            let screenshot = false;
            try
            {
                screenshot = yield scope.screenshot.create(url, width);
            }
            catch (e)
            {
                // nop
            }
            if (screenshot)
            {
                const file = new VinylFile(
                    {
                        path: filename,
                        contents: screenshot
                    });
                scope.cliLogger.end(work);
                return file;
            }
            else
            {
                scope.cliLogger.end(work, 'Could not take screenshot');
            }
            return false;
        });
        return promise;
    }


    /**
     * @returns {Promise<Array<VinylFile>>}
     */
    processEntity(entity, buildConfiguration, parameters)
    {
        /* istanbul ignore next */
        if (!entity)
        {
            this.logger.warn(this.className + '::processEntity - No entity given');
            return Promise.resolve(false);
        }

        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const result = [];
            const params = yield scope.prepareParameters(buildConfiguration, parameters);

            // Get suite
            const testSuite = entity.testSuites.findBy(
                {
                    name: 'cssregression',
                    site: entity.id.site
                });

            // Render screenshots
            if (testSuite)
            {
                for (const testCase of testSuite.tests)
                {
                    // Reference
                    if (params.screenshotForce || fs.existsSync(testCase.referenceImagePath) == false)
                    {
                        const file = yield scope.createScreenshot(entity, testCase.viewportWidth,
                            params.screenshotServerUrl + testCase.url, testCase.referenceImagePath);
                        if (file)
                        {
                            result.push(file);
                        }
                    }
                    // Test
                    if (!params.screenshotSkipTest)
                    {
                        const file = yield scope.createScreenshot(entity, testCase.viewportWidth,
                            params.screenshotServerUrl + testCase.url, testCase.testImagePath);
                        if (file)
                        {
                            result.push(file);
                        }
                    }
                }
            }
            return result;
        }).catch(ErrorHandler.handler(scope));
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.ScreenshotTask = ScreenshotTask;
