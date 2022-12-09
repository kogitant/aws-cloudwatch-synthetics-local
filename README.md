# AWS Cloudwatch Synthetics Local
The missing library to
* provide some typings for Synthetics and SyntheticsLogger in typescript canary scripts
* canary-run.js for running the scripts locally using puppeteer

# How to use this module?
In your ts project with canary scripts, use it as devDependency like this (both for Synthetics and SyntheticsLogger)
```
    "Synthetics": "file:./local-synthetics",
    "SyntheticsLogger": "file:./local-logger",
```


# Local logging
The most important part to make local terminal (console) logging work was to add this line to index.js:

```
// Set default logLevel to locally log everything.
setLogLevel(0);
```

When the canary scripts are executed locally and this local-logger library is in use, you should always see this in your terminal:
```
local-logger setting log level to  0
```


# Development
```
nvm use 14
export PUPPETEER_DOWNLOAD_PATH=~/.npm/chromium
npm i
```

# Licence & References
Thanks to https://github.com/sixleaveakkm/aws-synthetics-logger-local and https://github.com/sixleaveakkm/aws-synthetics-local for an almost working (up to date) version.
Thanks to https://github.com/jessiehernandez/aws-synthetics-logger-local/blob/master/index.d.ts for inspiration.

