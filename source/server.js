/**
 * Requirements
 * @ignore
 */
const Screenshot = require('./utils/Screenshot.js').Screenshot;
const fs = require('fs');

const ss = new Screenshot();
const started = Date.now();
ss.create('https://localhost:3000/brand/pages/p-bcontent/p-bcontent.j2', 400)
    .then((buffer) => fs.writeFileSync('screenshot.png', buffer))
    .then(() => console.log('screenshot taken', Date.now() - started))
    .then(() => ss.close());
