'use strict';

/**
 * Requirements
 * @ignore
 */
const CssRegressionConfiguration = require('../configuration/CssRegressionConfiguration.js').CssRegressionConfiguration;
const Screenshot = require('../utils/Screenshot.js').Screenshot;
const EntitiesTask = require('entoj-system').task.EntitiesTask;
const GlobalRepository = require('entoj-system').model.GlobalRepository;
const PathesConfiguration = require('entoj-system').model.configuration.PathesConfiguration;
const CliLogger = require('entoj-system').cli.CliLogger;
const ErrorHandler = require('entoj-system').error.ErrorHandler;
const assertParameter = require('entoj-system').utils.assert.assertParameter;
const VinylFile = require('vinyl');
const co = require('co');
const path = require('path');


/**
 * @memberOf task
 */
class ScreenshotTask extends EntitiesTask
{
    /**
     * @param {cli.CliLogger} cliLogger
     * @param {model.GlobalRepository} globalRepository
     * @param {model.configuration.PathesConfiguration} pathesConfiguration
     * @param {configuration.CssRegressionConfiguration} moduleConfiguration
     */
    constructor(cliLogger, globalRepository, pathesConfiguration, moduleConfiguration)
    {
        super(cliLogger, globalRepository);

        //Check params
        assertParameter(this, 'pathesConfiguration', pathesConfiguration, true, PathesConfiguration);
        assertParameter(this, 'moduleConfiguration', moduleConfiguration, true, CssRegressionConfiguration);

        // Assign options
        this._pathesConfiguration = pathesConfiguration;
        this._moduleConfiguration = moduleConfiguration;
        this._screenshot = new Screenshot();
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [CliLogger, GlobalRepository, PathesConfiguration] };
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
            if (!params.screenshotFilenameTemplate)
            {
                params.screenshotFilenameTemplate = '${entityId.idString}-${name}@${width}.png';
            }
            if (!params.screenshotViewportWidths)
            {
                params.screenshotViewportWidths = scope.moduleConfiguration.viewportWidths;
            }
            if (!params.screenshotServerBaseUrl)
            {
                params.screenshotServerBaseUrl = 'http://localhost:3000';
            }
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
    renderEntity(entity, entitySettings, buildConfiguration, parameters)
    {
        if (!entity)
        {
            this.logger.warn(this.className + '::renderEntity - No entity given');
            return Promise.resolve(false);
        }

        const scope = this;
        const promise = co(function *()
        {
            // Prepare
            const params = yield scope.prepareParameters(buildConfiguration, parameters);
            const files = [];
            const settings = entitySettings || {};
            settings.url = settings.url || 'examples/overview.j2';
            settings.name = settings.name || path.basename(settings.url, '.j2');
            settings.viewportWidths = settings.viewportWidths || params.screenshotViewportWidths;

            // Export
            const work = scope.cliLogger.work('Exporting <' + entity.pathString + '>');
            for (const width of settings.viewportWidths)
            {
                const filename = yield scope.pathesConfiguration.resolve(params.screenshotFilenameTemplate,
                    {
                        site: entity.id.site,
                        entityCategory: entity.id.category,
                        entityId: entity.id,
                        width: width,
                        name: settings.name
                    });
                const url = params.screenshotServerBaseUrl + '/' + settings.url + '?static=true';
                const work = scope.cliLogger.work('Rendering <' + entity.pathString + '/' + settings.url + '> for viewport <' + width + '> as <' + filename + '>');
                let screenshot = false;
                try
                {
                    screenshot = yield scope.screenshot.create(url, width);
                }
                catch (e)
                {
                    // Nop
                }
                if (screenshot)
                {
                    const file = new VinylFile(
                        {
                            path: filename,
                            contents: screenshot
                        });
                    files.push(file);
                    scope.cliLogger.end(work);
                }
                else
                {
                    scope.cliLogger.end(work, 'Could not take screenshot');
                }
            }
            scope.cliLogger.end(work);

            // Done
            return files;
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
            // Render each configured screenshot
            const result = [];
            const settings = entity.properties.getByPath('test.cssregression', []);
            for (const setting of settings)
            {
                // Render screenshot
                const files = yield scope.renderEntity(entity, setting, buildConfiguration, parameters);
                if (files)
                {
                    const filesArray = Array.isArray(files)
                        ? files
                        : [files];
                    result.push(...filesArray);
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
