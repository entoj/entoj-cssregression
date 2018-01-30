'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('entoj-system').Base;
const BuildConfiguration = require('entoj-system').model.configuration.BuildConfiguration;
const GlobalConfiguration = require('entoj-system').model.configuration.GlobalConfiguration;
const assertParameter = require('entoj-system').utils.assert.assertParameter;


/**
 * @memberOf configuration
 */
class CssRegressionConfiguration extends Base
{
    /**
     * @param  {model.configuration.GlobalConfiguration} globalConfiguration
     * @param  {model.configuration.BuildConfiguration} buildConfiguration
     */
    constructor(globalConfiguration, buildConfiguration)
    {
        super();

        //Check params
        assertParameter(this, 'globalConfiguration', globalConfiguration, true, GlobalConfiguration);
        assertParameter(this, 'buildConfiguration', buildConfiguration, true, BuildConfiguration);

        // Create configuration
        this._testDataTemplate = globalConfiguration.get('cssregression.testDataTemplate',
            '${entityTemplate}/tests/cssregression.json');
        this._referenceImageTemplate = globalConfiguration.get('cssregression.referenceImageTemplate',
            '${entityTemplate}/tests/cssregression/${name}-${os}-@${width}.png');
        this._testImageTemplate = globalConfiguration.get('cssregression.estImageTemplate',
            '${cache}/tests/cssregression/${site.name.urlify()}-${name}-${os}-@${width}.png');
        this._differenceImageTemplate = globalConfiguration.get('cssregression.differenceImageTemplate',
            '${cache}/tests/cssregression/${site.name.urlify()}-${name}-${os}-@${width}-difference.png');
        this._viewportWidths = globalConfiguration.get('cssregression.viewportWidths', [320, 768, 1024, 1280]);
        this._serverBaseUrl = globalConfiguration.get('server.baseUrl', false);
        this._differenceThreshold = globalConfiguration.get('cssregression.differenceThreshold', 100);
    }


    /**
     * @inheritDoc
     */
    static get injections()
    {
        return { 'parameters': [GlobalConfiguration, BuildConfiguration] };
    }


    /**
     * @inheritDoc
     */
    static get className()
    {
        return 'configuration/CssRegressionConfiguration';
    }


    /**
     * Template for entity specific test data
     *
     * @type {String}
     */
    get testDataTemplate()
    {
        return this._testDataTemplate;
    }


    /**
     * Template for reference image filenames
     *
     * @type {String}
     */
    get referenceImageTemplate()
    {
        return this._referenceImageTemplate;
    }


    /**
     * Template for test image filenames
     *
     * @type {String}
     */
    get testImageTemplate()
    {
        return this._testImageTemplate;
    }


    /**
     * Template for difference image filenames
     *
     * @type {String}
     */
    get differenceImageTemplate()
    {
        return this._differenceImageTemplate;
    }


    /**
     * A list of viewport widths used for screenshots
     *
     * @type {Array}
     */
    get viewportWidths()
    {
        return this._viewportWidths;
    }


    /**
     * Threshold of changed pixels to fail a test
     *
     * @type {Number}
     */
    get differenceThreshold()
    {
        return this._differenceThreshold;
    }


    /**
     * @type {String}
     */
    get serverBaseUrl()
    {
        return this._serverBaseUrl;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CssRegressionConfiguration = CssRegressionConfiguration;
