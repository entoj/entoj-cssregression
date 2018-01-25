'use strict';

/**
 * Requirements
 * @ignore
 */
const Base = require('entoj-system').Base;
const co = require('co');
const puppeteer = require('puppeteer');
const ErrorHandler = require('entoj-system').error.ErrorHandler;


/**
 * @memberOf cssregression
 */
class Screenshot extends Base
{
    /**
     * @inheritDocs
     */
    static get className()
    {
        return 'utils/Screenshot';
    }


    /**
     * @returns {Promise<Buffer>}
     */
    create(url, width)
    {
        const scope = this;
        const promise = co(function *()
        {
            // Get browser
            if (!scope.browser)
            {
                scope.browser = yield puppeteer.launch(
                    {
                        ignoreHTTPSErrors: true,
                        headless: true
                    });
            }

            // Get page and open url
            const page = yield scope.browser.newPage();
            const waitForLoaded = page.waitForNavigation(
                {
                    timeout: 5000,
                    waitUntil: ['load', 'networkidle2']
                });
            try
            {
                yield page.setViewport(
                    {
                        width: width,
                        height: 100
                    });
                yield page.goto(url);
                yield waitForLoaded;
            }
            catch (e)
            {
                yield page.close();
                return false;
            }

            // Now take screenshot
            const buffer = yield page.screenshot(
                {
                    fullPage: true
                });

            // Done
            yield page.close();
            return buffer;
        }).catch(ErrorHandler.handler(scope));
        return promise;
    }


    /**
     * @returns {Promise}
     */
    close()
    {
        const scope = this;
        const promise = co(function *()
        {
            if (scope.browser)
            {
                yield scope.browser.close();
            }
        }).catch(ErrorHandler.handler(scope));
        return promise;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.Screenshot = Screenshot;
