'use strict';

/**
 * Requirements
 * @ignore
 */
const EntitiesTask = require('entoj-system').task.EntitiesTask;
const GlobalRepository = require('entoj-system').model.GlobalRepository;
const CliLogger = require('entoj-system').cli.CliLogger;
const ErrorHandler = require('entoj-system').error.ErrorHandler;
const VinylFile = require('vinyl');
const streamBuffers = require('stream-buffers');
const co = require('co');
const fs = require('co-fs-extra');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');


/**
 * @memberOf task
 */
class CompareTask extends EntitiesTask
{
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
        return 'task/CompareTask';
    }


    /**
     * @protected
     * @returns {Promise<PNG>}
     */
    readPng(filename)
    {
        const promise = new Promise((resolve) =>
        {
            const result = new PNG();
            const data = fs.readFileSync(filename);
            result.parse(data, () => resolve(result));
        });
        return promise;
    }


    /**
     * @protected
     * @returns {Promise<Buffer>}
     */
    writePng(filename, png)
    {
        const promise = new Promise((resolve) =>
        {
            const bufferStream = new streamBuffers.WritableStreamBuffer();
            bufferStream.on('finish', function()
            {
                const file = new VinylFile(
                    {
                        path: filename,
                        contents: bufferStream.getContents()
                    });
                resolve(file);
            });
            png.pack()
                .pipe(bufferStream);
        });
        return promise;
    }


    /**
     * @protected
     * @returns {Promise<Array>}
     */
    prepareParameters(buildConfiguration, parameters)
    {
        const parent = super.prepareParameters(buildConfiguration, parameters);
        const scope = this;
        const promise = co(function*()
        {
            const params = yield parent;
            params.query = params.query || '*';
            params.threshold = params.threshold || 1;
            return params;
        }).catch(ErrorHandler.handler(scope));
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

            // Compare screenshots
            if (testSuite)
            {
                testSuite.isValid = true;
                testSuite.ok = 0;
                testSuite.failed = 0;
                for (const testCase of testSuite.tests)
                {
                    const work = scope.cliLogger.work('Comparing <' + entity.pathString + '>@<' + testCase.viewportWidth + '>');
                    const referenceExists = yield fs.exists(testCase.referenceImagePath);
                    const testExists = yield fs.exists(testCase.testImagePath);
                    if (!referenceExists || !testExists)
                    {
                        testCase.isValid = false;
                        testSuite.failed++;
                        testSuite.isValid = false;
                        scope.cliLogger.end(work, 'Files not found');
                    }
                    else
                    {
                        const referenceImage = yield scope.readPng(testCase.referenceImagePath);
                        const testImage = yield scope.readPng(testCase.testImagePath);
                        if (referenceImage.width == 0 ||
                            referenceImage.height == 0 ||
                            referenceImage.width != testImage.width ||
                            referenceImage.height != testImage.height)
                        {
                            testCase.isValid = false;
                            testSuite.failed++;
                            testSuite.isValid = false;
                            scope.cliLogger.end(work, 'Images not found or wring size');
                        }
                        else
                        {
                            const differenceImage = new PNG(
                                {
                                    width: referenceImage.width,
                                    height: referenceImage.height
                                });
                            const comparison = pixelmatch(referenceImage.data, testImage.data, differenceImage.data,
                                referenceImage.width, referenceImage.height, { threshold: 0.1 });
                            const differenceFile = yield scope.writePng(testCase.differenceImagePath, differenceImage);
                            if (differenceFile)
                            {
                                result.push(differenceFile);
                            }
                            if (comparison > params.threshold)
                            {
                                testCase.isValid = false;
                                testSuite.failed++;
                                testSuite.isValid = false;
                                scope.cliLogger.end(work, 'Images difference ' + comparison);
                            }
                            else
                            {
                                testCase.isValid = true;
                                testSuite.ok++;
                                scope.cliLogger.end(work);
                            }
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
module.exports.CompareTask = CompareTask;
