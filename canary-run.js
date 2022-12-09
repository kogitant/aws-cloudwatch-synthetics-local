#!/usr/bin/env node

const synthetics = require('./index')
const path = require('path')
const yargs = require('yargs')
    .usage("Usage: $0 [options] <handler>")
    .example([
        ['$0 index.handler', 'use index.js in current directory and use exported handler to run canary']
    ])
    .option('headlessMode', {
        alias: 'm',
        type: 'boolean',
        default: false,
        description: 'puppeteer headlessMode'
    })
    .option('screenshotDir', {
        alias: 'd',
        type: 'string',
        default: '.screenshot',
        description: 'relative path for screenshot, will be created if not exists'
    })
    .option('logLevel', {
        alias: 'l',
        type: 'number',
        default: 0,
        description: 'Log level: 0: debug, 1: info, 2: warn, 3: error'
    })
    .option('slowMo', {
        alias: 's',
        type: 'number',
        default: 0,
        description: 'The slowMo option slows down Puppeteer operations by the specified amount of milliseconds. It\'s another way to help see what\'s going on.'
    }), argv = yargs.argv;

async function execute(entry, headlessMode=false, screenshotDir=".screenshot", logLevel = 1, slowMo = 0) {
    console.info(`Start Canary, headlessMode=${headlessMode}, screenshotDir=${screenshotDir}, logLevel=${logLevel}, slowMo=${slowMo}`);

    await synthetics.setLogLevel(logLevel);
    await synthetics.start(headlessMode, screenshotDir, slowMo);
    try{
        let lib = path.join(process.cwd(), entry.split('.')[0])
        console.log(`process dir: ${process.cwd()}, entry: [${entry}], lib: [${lib}]`);
        const script = require(lib)
        await script[entry.split('.')[1]]();
        console.log("CANARY PASSED");
    } catch (e) {
        console.error(e);
        console.log("CANARY FAILED")
    } finally {
        await synthetics.close()
    }
}

if (argv.h === true) {
    yargs.showHelp()
    process.exit(0)
}

if (argv._.length !== 1) {
    yargs.showHelp()
    process.exit(1)
} else {
    (async () => {
        await execute(argv._[0], argv.m, argv.d, argv.logLevel, argv.slowMo)
    })();
}
