Thanks to https://github.com/sixleaveakkm/aws-synthetics-logger-local for an almost working version
And thanks to https://github.com/jessiehernandez/aws-synthetics-logger-local/blob/master/index.d.ts for apparently a bug fixed version

The most important part to make local terminal (console) logging work was to add this line to index.js:

```
// Set default logLevel to locally log everything.
setLogLevel(0);
```

When the canary scripts are executed locally and this local-logger library is in use, you should always see this in your terminal:
```
local-logger setting log level to  0
```

# How to use this module?
In your ts project with canary scripts, use it as devDependency like this (both for Synthetics and SyntheticsLogger) 
```
    "Synthetics": "file:./local-synthetics",
    "SyntheticsLogger": "file:./local-logger",
```

# Development
```
nvm use 14
export PUPPETEER_DOWNLOAD_PATH=~/.npm/chromium
npm i
```
