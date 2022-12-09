const puppeteer = require("puppeteer")
const log = require('loglevel')
const path = require("path")
const fs = require('fs')
const http = require('http');
const https = require('https');

let browser
let page

let screenShotPath = ".screenshot"
let userAgent = "CloudWatchSynthetics-Local"
let index = 0

let logLevel = 1;

function setLogLevel(l) {
  console.info("local-logger setting log level to ", l);
  if (typeof l === "number" && (l === 0 || l === 1 || l === 2 || l === 3)) {
    logLevel = l
    log.setLevel(l + 1)
    return
  }
  throw new Error("log level must be 0 | 1 | 2 | 3")
}

function getLogLevel() {
  return logLevel
}

exports.setLogLevel = setLogLevel
exports.getLogLevel = getLogLevel
exports.debug       = function () { log.debug.apply(log, arguments) }
exports.error       = function () { log.error.apply(log, arguments) }
exports.info        = function () { log.info.apply(log, arguments)  }
exports.log         = function () { log.log.apply(log, arguments)   }
exports.warn        = function () { log.warn.apply(log, arguments)  }

exports.addUserAgent = async (page, userAgentString) => {
  userAgent += " " + userAgentString
  await page.setUserAgent(userAgent)
}

exports.getCanaryUserAgentString = () => {
  return userAgent
}

function setConfig(config){
  return;
}

function getConfiguration() {
  return {
    setConfig: setConfig
  }
}

exports.getConfiguration = getConfiguration


function setUpDebugLoggingOfPage(page) {
  // Emitted when the DOM is parsed and ready (without waiting for resources)
  page.once('domcontentloaded', () => log.info('✅ DOM is ready'));

  // Emitted when the page is fully loaded
  page.once('load', () => log.info('✅ Page is loaded'));

  // Emitted when the page attaches a frame
  page.on('frameattached', () => log.info('✅ Frame is attached'));

  // Emitted when a frame within the page is navigated to a new URL
  page.on('framenavigated', () => log.info('👉 Frame is navigated'));

  // Emitted when a script within the page uses `console.timeStamp`
  // @ts-ignore
  page.on('metrics', data => log.info(`👉 Timestamp added at ${data.metrics.Timestamp}`));

  // Emitted when a script within the page uses `console`
  // @ts-ignore
  page.on('console', message => console[message.type()](`👉 ${message.text()}`));

  // Emitted when the page emits an error event (for example, the page crashes)
  // @ts-ignore
  page.on('error', error => log.error(`❌ ${error}`));

  // Emitted when a script within the page has uncaught exception
  // @ts-ignore
  page.on('pageerror', error => log.error(`❌ ${error}`));

  // Emitted when a script within the page uses `alert`, `prompt`, `confirm` or `beforeunload`
  // @ts-ignore
  page.on('dialog', async dialog => {
    log.info(`👉 ${dialog.message()}`);
    await dialog.dismiss();
  });

  // Emitted when a new page, that belongs to the browser context, is opened
  page.on('popup', () => log.info('👉 New page is opened'));

  // Emitted when the page produces a request
  // @ts-ignore
  page.on('request', request => log.info(`👉 Request: ${request.url()}`));

  // Emitted when a request, which is produced by the page, fails
  // @ts-ignore
  page.on('requestfailed', request => log.info(`❌ Failed request: ${request.url()}`));

  // Emitted when a request, which is produced by the page, finishes successfully
  // @ts-ignore
  page.on('requestfinished', request => log.info(`👉 Finished request: ${request.url()}`));

  // Emitted when a response is received
  // @ts-ignore
  page.on('response', response => log.info(`👉 Response: ${response.url()}`));

  // Emitted when the page creates a dedicated WebWorker
  // @ts-ignore
  page.on('workercreated', worker => log.info(`👉 Worker: ${worker.url()}`));

  // Emitted when the page destroys a dedicated WebWorker
  // @ts-ignore
  page.on('workerdestroyed', worker => log.info(`👉 Destroyed worker: ${worker.url()}`));

  // Emitted when the page detaches a frame
  page.on('framedetached', () => log.info('✅ Frame is detached'));

  // Emitted after the page is closed
  page.once('close', () => log.info('✅ Page is closed'));
}

exports.getPage = async () => {
  const pages = await this.browser.pages()
  console.log(pages.length)
  if (pages.length <= 1) {
    this.page = await this.browser.newPage()
  }

  if(this.logLevel === 0){
    log.debug("Attaching debug logger to page")
    setUpDebugLoggingOfPage(this.page);
  }

  return this.page
}

exports.executeHttpStep = async (stepName, requestOptions, validateFn, stepConfig) => {

  let req;
  if(requestOptions['protocol'] === 'https:'){
    req = https.request(requestOptions, validateFn);
  }else{
    req = http.request(requestOptions, validateFn);
  }
  if(requestOptions['body']) {
    req.write(requestOptions['body'])
  }
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.end();

  console.info(`PASS ${stepName}` )

}

exports.executeStep = async (stepName = null, func) => {
  index++;
  let currIdx = index

  let name = ""
  if (stepName !== null) {
    name = `-${stepName}`
  }

  log.info(`executeStep "${currIdx}${name}" start`)

  await this.page.screenshot({path: path.join(screenShotPath, `${currIdx}${name}-starting.png`)})

  const start = Date.now()

  try {
    await func()
    log.info(`executeStep "${currIdx}${name}" succeeded`)
    await this.page.screenshot({path: path.join(screenShotPath, `${currIdx}${name}-succeeded.png`)})
  } catch (e) {
    log.info(e)
    log.info(`executeStep "${currIdx}${name}" failed`)
    await this.page.screenshot({path: path.join(screenShotPath, `${currIdx}${name}-failed.png`)})
    throw e
  } finally {
    const end = Date.now()
    const d = end - start
    log.info(`${name}: ${Math.floor(d / 1000)} seconds`)
  }
}

exports.takeScreenshot = async (stepName, suffix) => {
  index++;
  let currIdx = index
  return await this.page.screenshot({path: path.join(screenShotPath, `${currIdx}-${stepName}-${suffix}.png`)})
}

exports.getRequestResponseLogHelper = () => {
  return helper
}

exports.setRequestResponseLogHelper = (newHelper) => {
  helper = newHelper
}

let helper = function () {
  let RequestResponseLogHelper = () => {
    this.request = {url: true, resourceType: false, method: false, headers: false, postData: false};
    this.response = {status: true, statusText: true, url: true, remoteAddress: false, headers: false};
  }

  RequestResponseLogHelper.prototype.withLogRequestUrl = (b) => {
    this.request.url = b
  }

  RequestResponseLogHelper.prototype.withLogRequestResourceType = (b) => {
    this.request.resourceType = b
  }

  RequestResponseLogHelper.prototype.withLogRequestMethod = (b) => {
    this.request.method = b
  }

  RequestResponseLogHelper.prototype.withLogRequestHeaders = (b) => {
    this.request.headers = b
  }

  RequestResponseLogHelper.prototype.withLogRequestPostData = (b) => {
    this.request.postData = b
  }

  RequestResponseLogHelper.prototype.withLogResponseStatus = (b) => {
    this.response.status = b
  }

  RequestResponseLogHelper.prototype.withLogResponseStatusText = (b) => {
    this.response.statusText = b
  }

  RequestResponseLogHelper.prototype.withLogResponseUrl = (b) => {
    this.response.url = b
  }

  RequestResponseLogHelper.prototype.withLogResponseRemoteAddress = (b) => {
    this.response.remoteAddress = b
  }

  RequestResponseLogHelper.prototype.withLogResponseHeaders = (b) => {
    this.response.headers = b
  }

  return {
    RequestResponseLogHelper: RequestResponseLogHelper
  }
}



// ***********************************************************************

exports.start = async (headlessMode, screenshotDir, slowMo=0) => {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir)
  }
  this.browser = await puppeteer.launch({
    headless: headlessMode,
    defaultViewport: {
      width: 1024,
      height: 768,
    },
    slowMo: slowMo
  })
  if(slowMo>0) {
    log.warn(`Browser slowed down by ${slowMo}`)
  }
}

exports.close = async () => {
  await this.browser.close()
}
