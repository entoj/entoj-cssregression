'use strict';

/**
 * Configure path
 */
const path = require('path');
global.CSSREGRESSION_SOURCE = path.resolve(__dirname + '/../source');
global.CSSREGRESSION_FIXTURES = path.resolve(__dirname + '/__fixtures__');
global.CSSREGRESSION_TEST = __dirname;

/**
 * Configure chai
 */
const chai = require('chai');
chai.config.includeStack = true;
global.expect = chai.expect;
