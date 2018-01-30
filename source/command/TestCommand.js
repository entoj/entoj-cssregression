'use strict';

/**
 * Requirements
 * @ignore
 */
const Command = require('entoj-system').command.Command;
const CliLogger = require('entoj-system').cli.CliLogger;
const Context = require('entoj-system').application.Context;
const PathesConfiguration = require('entoj-system').model.configuration.PathesConfiguration;
const ScreenshotTask = require('../task/ScreenshotTask.js').ScreenshotTask;
const CompareTask = require('../task/CompareTask.js').CompareTask;
const BuildConfiguration = require('entoj-system').model.configuration.BuildConfiguration;
const WriteFilesTask = require('entoj-system').task.WriteFilesTask;
const co = require('co');


/**
 * @memberOf command
 */
class TestCommand extends Command
{
    /**
     *
     */
    constructor(context, options)
    {
        super(context);

        this._name = 'cssregression';
        this._options = options || {};
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [Context, 'cssregression/TestCommand.options'] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'cssregression/TestCommand';
    }


    /**
     * @inheritDoc
     */
    get help()
    {
        const help =
        {
            name: this._name,
            description: 'Provides css regression testing',
            actions:
            [
                {
                    name: 'reference',
                    description: 'Create the reference or baseline images used to detect changes',
                    options:
                    [
                        {
                            name: 'query',
                            type: 'inline',
                            optional: true,
                            defaultValue: '*',
                            description: 'Query for sites to use e.g. /base'
                        }
                    ]
                },
                {
                    name: 'test',
                    description: 'Create new images and compares them to the reference or baseline images to detect changes',
                    options:
                    [
                        {
                            name: 'query',
                            type: 'inline',
                            optional: true,
                            defaultValue: '*',
                            description: 'Query for sites to use e.g. /base'
                        }
                    ]
                }
            ]
        };
        return help;
    }


    /**
     * @inheritDoc
     * @returns {Promise<Server>}
     */
    reference(parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            const logger = scope.createLogger('command.cssregression.reference');
            const mapping = new Map();
            mapping.set(CliLogger, logger);
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const options =
            {
                writePath: pathesConfiguration.root,
                screenshotSkipTest: true,
                screenshotForce: true
            };
            const buildConfiguration = scope.context.di.create(BuildConfiguration);
            yield scope.context.di.create(ScreenshotTask, mapping)
                .pipe(scope.context.di.create(WriteFilesTask, mapping))
                .run(buildConfiguration, options);
        });
        return promise;
    }


    /**
     * @inheritDoc
     * @returns {Promise<Server>}
     */
    test(parameters)
    {
        const scope = this;
        const promise = co(function *()
        {
            const logger = scope.createLogger('command.cssregression.test');
            const mapping = new Map();
            mapping.set(CliLogger, logger);
            const pathesConfiguration = scope.context.di.create(PathesConfiguration);
            const options =
            {
                writePath: pathesConfiguration.root
            };
            const buildConfiguration = scope.context.di.create(BuildConfiguration);
            yield scope.context.di.create(ScreenshotTask, mapping)
                .pipe(scope.context.di.create(WriteFilesTask, mapping))
                .run(buildConfiguration, options);
            yield scope.context.di.create(CompareTask, mapping)
                .pipe(scope.context.di.create(WriteFilesTask, mapping))
                .run(buildConfiguration, options);
        });
        return promise;
    }


    /**
     * @inheritDoc
     * @returns {Promise<Server>}
     */
    dispatch(action, parameters)
    {
        switch (action)
        {
            case 'reference':
                return this.reference();

            default:
                return this.test();
        }
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.TestCommand = TestCommand;
