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
        this._referenceShotTemplate = globalConfiguration.get('cssregression.referenceShotTemplate',
            '${entityTemplate}/tests/cssregression/${name}-${suffix}-@${width}.png');
        this._viewportWidths = globalConfiguration.get('cssregression.viewportWidths', [320, 768, 1024, 1280]);
        this._serverBaseUrl = false;
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
     * Template for reference screenshot filenames
     *
     * @type {String}
     */
    get referenceShotTemplate()
    {
        return this._referenceShotTemplate;
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
}


/**
 * Exports
 * @ignore
 */
module.exports.CssRegressionConfiguration = CssRegressionConfiguration;
