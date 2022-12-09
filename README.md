# AWS Cloudwatch Synthetics Local
The missing library to
* provide some typings for Synthetics and SyntheticsLogger in typescript canary scripts
* canary-run.js for running the scripts locally using puppeteer

# How to use this module?
In your ts project with canary scripts, use it as devDependency like this (both for Synthetics and SyntheticsLogger)
```
    "Synthetics": "kogitant/aws-cloudwatch-synthetics-local#main",
    "SyntheticsLogger": "kogitant/aws-cloudwatch-synthetics-local#main",
```

# Running scripts locally
In your project with typescript canary scripts, you can do stuff like:
```
export PUPPETEER_DOWNLOAD_PATH=~/.npm/chromium
npm i
tsc
mkdir -p canary/output/screenshot
mkdir -p canary/output/pdf
mkdir -p canary/output/trace
./node_modules/Synthetics/canary-run.js --help
# Run test without browser window popping up
./node_modules/Synthetics/canary-run.js --headlessMode true --screenshotDir canary/output/screenshot src/001_12chrmax.handler
# Run test with browse window visible
./node_modules/Synthetics/canary-run.js --headlessMode false --screenshotDir canary/output/screenshot src/001_12chrmax.handler
./node_modules/Synthetics/canary-run.js --headlessMode true --screenshotDir canary/output/screenshot src/004_envvar.handler
DEBUG="puppeteer:*" ./node_modules/Synthetics/canary-run.js --headlessMode false --screenshotDir canary/output/screenshot src/005_cookies.handler
tsc src/001_12chrmax.ts && ./node_modules/Synthetics/canary-run.js --headlessMode true --screenshotDir canary/output/screenshot src/001_12chrmax.handler
tsc src/005_metrics.ts && ./node_modules/Synthetics/canary-run.js --headlessMode true --screenshotDir canary/output/screenshot src/005_metrics.handler
TRACE_DIR=canary/output/trace ./node_modules/Synthetics/canary-run.js --headlessMode true --screenshotDir canary/output/screenshot src/006_tracing.handler
PDF_DIR=canary/output/pdf ./node_modules/Synthetics/canary-run.js --headlessMode true --screenshotDir canary/output/screenshot src/008_pdf.handler
# No debug logging, but slow mo
./node_modules/Synthetics/canary-run.js --headlessMode false --screenshotDir canary/output/screenshot --logLevel 2 --slowMo 500 src/010_n_steps.handler
```

# Local (development) logging
The most important part to make local terminal (console) logging work was to add this line to index.js:

```
// Set default logLevel to locally log everything.
setLogLevel(0);
```

When the canary scripts are executed locally and this local-logger library is in use, you should always see this in your terminal:
```
local-logger setting log level to  0
```


# Development of this library
```
nvm use 14
export PUPPETEER_DOWNLOAD_PATH=~/.npm/chromium
npm i
```


## Version compatibility
You probably want to keep this codebase versions in sync with used AWS Canary runtime environment versions.
See for example https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Library_nodejs_puppeteer.html#CloudWatch_Synthetics_runtimeversion-nodejs-puppeteer-3.8
It specifies
```
// Lambda runtime Node.js 14.x
// Puppeteer-core version 10.1.0
// Chromium version 92.0.4512
```

Due to this, the root package.json of this project specifies:
```
"node": ">=14.17.0 <15.0.0",
```

## Tracking @aws-cdk/aws-synthetics-alpha releases and improvements
https://github.com/aws/aws-cdk/commits/main?branch=main&path%5B%5D=packages&path%5B%5D=%40aws-cdk&path%5B%5D=aws-synthetics&qualified_name=refs%2Fheads%2Fmain

# Licence & References
Thanks to https://github.com/sixleaveakkm/aws-synthetics-logger-local and https://github.com/sixleaveakkm/aws-synthetics-local for an almost working (up to date) version.
Thanks to https://github.com/jessiehernandez/aws-synthetics-logger-local/blob/master/index.d.ts for inspiration.

