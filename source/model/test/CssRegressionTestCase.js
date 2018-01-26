'use strict';

/**
 * Requirements
 * @ignore
 */
const ValueObject = require('entoj-system').model.ValueObject;


/**
 * Describes a Test case
 *
 * @memberOf model.test
 * @extends model.ValueObject
 */
class CssRegressionTestCase extends ValueObject
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'model.test/CssRegressionTestCase';
    }


    /**
     * @inheritDocs
     */
    get fields()
    {
        const fields = super.fields;
        fields.name = '';
        fields.isValid = false;
        fields.viewportWidth = 0;
        fields.referenceImagePath = '';
        fields.testImagePath = '';
        fields.differenceImagePath = '';
        fields.url = '';
        return fields;
    }


    /**
     * @property {String}
     */
    get name()
    {
        return this._name;
    }

    set name(value)
    {
        this._name = value;
    }


    /**
     * @property {String}
     */
    get url()
    {
        return this._url;
    }

    set url(value)
    {
        this._url = value;
    }


    /**
     * @property {Boolean}
     */
    get isValid()
    {
        return this._isValid;
    }

    set isValid(value)
    {
        this._isValid = value;
    }


    /**
     * @property {Number}
     */
    get viewportWidth()
    {
        return this._viewportWidth;
    }

    set viewportWidth(value)
    {
        this._viewportWidth = value;
    }


    /**
     * @property {String}
     */
    get referenceImagePath()
    {
        return this._referenceImagePath;
    }

    set referenceImagePath(value)
    {
        this._referenceImagePath = value;
    }


    /**
     * @property {String}
     */
    get testImagePath()
    {
        return this._testImagePath;
    }

    set testImagePath(value)
    {
        this._testImagePath = value;
    }


    /**
     * @property {String}
     */
    get differenceImagePath()
    {
        return this._differenceImagePath;
    }

    set differenceImagePath(value)
    {
        this._differenceImagePath = value;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.CssRegressionTestCase = CssRegressionTestCase;
