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
        this._referenceShotTemplate = globalConfiguration.get('cssregression.referenceShotTemplate',
            '${entityTemplate}/tests/cssregression/${name}-${breakpoint}-${suffix}.png');
    }


    /**
     * @inheritDocs
     */
    static get injections()
    {
        return { 'parameters': [GlobalConfiguration, BuildConfiguration] };
    }


    /**
     * @inheritDocss
     */
    static get className()
    {
        return 'configuration/CssRegressionConfiguration';
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
}


/**
 * Exports
 * @ignore
 */
module.exports.CssRegressionConfiguration = CssRegressionConfiguration;
