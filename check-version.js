const core = require('@actions/core');
const request = require('request');
const this_version = require('./package.json').version;

// 如果当前版本号 > npm 远程库版本号，则发布新版本到 npm
try {
    request.get("https://registry.npmjs.org/tqchart", function(error, response, body) {
        const version = JSON.parse(body)['dist-tags'].latest
        console.log(this_version, version, this_version > version)
        if (this_version > version) {
            core.setOutput("should_publish", "1");
        } else {
            core.setOutput("should_publish", "0");
        }
    })
} catch (error) {
  core.setFailed(error.message);
}
