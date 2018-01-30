
/**
 * Registers with default configurations
 */
function register(configuration, options)
{
    // Commands
    configuration.commands.add(require('./command/index.js').TestCommand);

    // Entities
    configuration.mappings.add(require('entoj-system').model.entity.EntitiesLoader,
        {
            '!plugins':
            [
                require('./model/index.js').loader.documentation.CssRegressionTestsPlugin
            ]
        });
}


/**
 * Exports
 * @ignore
 */
module.exports =
{
    register: register,
    command: require('./command/index.js'),
    configuration: require('./configuration/index.js'),
    model: require('./model/index.js'),
    task: require('./task/index.js'),
    utils: require('./utils/index.js')
};
