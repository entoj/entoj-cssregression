'use strict';

/**
 * Requirements
 */
const http = require('http');


/**
 * Test http server
 */
class TestServer
{
    /**
     */
    content(value)
    {
        this.content = value;
        return this;
    }


    /**
     */
    start(port)
    {
        this.requests = [];
        this.server = http.createServer((req, res) =>
        {
            this.requests.push(req.url);
            res.write('<!DOCTYPE html><html><body>' + (this.content || '') + '</body></html>');
            res.end();
        });
        this.server.listen(port);
        return this;
    }


    /**
     */
    stop()
    {
        if (this.server)
        {
            this.server.close();
        }
        return this;
    }
}


/**
 * Exports
 * @ignore
 */
module.exports.TestServer = TestServer;
