#  Portfolio-api - API](https://github.com/pcesarmx/portfolio-api/)

[Portfolio-API](https://github.com/pcesarmx/portfolio-api/) This module helps the "contact me" form from the portfolio to process the requests using nodejs or aws lambda functions.

## Preview


[![Portfolio Preview1](https://raw.githubusercontent.com/pcesarmx/portfolio-api/master/assets/preview1.png)](#)
[![Portfolio Preview1](https://raw.githubusercontent.com/pcesarmx/portfolio-api/master/assets/preview2.png)](#)

<!-- <a href="http://api.pruvalcaba.com/" target="_blank">View Live Preview using "Contact Page"</a> -->
**[View Live Preview using "Contact Page" ](http://api.pruvalcaba.com/){:target="_blank"}**

## Status

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/pcesarmx/portfolio/master/LICENSE)

## Download and Installation

To begin using this module, choose one of the following options to get started:

* Download the latest release Or clone the repo: `git clone https://github.com/pcesarmx/portfolio-api.git`

* Install grunt (if you don't have it installed) `npm i -g grunt` 

## Usage
npm i

grunt

### Basic Usage

After downloading: 

Eimply edit or cretae a js file `/v1/{your_endpoint}/{your_endpoint}.js`.

Edit or cretae a js file `/classes/{your_class}.js`.

edit `_private_config.json` with your own (twilio / gmail settings) and rename the file to `private_config.json`

Open your web browser: localhost:5800

### Advanced Usage

After downloading, simply edit or cretae a json file `/v1/{your_endpoint}/_test.json` to perform your test.

### Deploy to production

AWS Elasticbeanstalk Deploy:

* `eb init`

* `eb create [ENV_NAME]`

* `eb setenv DEV_ENV=production` or all at once `eb setenv DEV_ENV=production TWILIO_NUMBER=+1112223333 ... [all your config features]` See `_private_config.json` and `config.js`

* `eb use [ENV_NAME]`

* Remember to commit your changed before `eb deploy`

* `eb deploy` or `eb deploy [ENV_NAME]`


AWS Lambda - GATEWAY Deploy:

* Coming Soon ...

***[More info about EB CLI ](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb3-cmd-commands.html){:target="_blank"}***

#### Grunt Tasks

- `grunt` the default task that builds everything

## Bugs and Issues

Have a bug or an issue with this template? [Open a new issue](https://github.com/pcesarmx/portfolio-api/issues) here on GitHub.

## Custom Builds

You can hire Portfolio-api to create a custom build of any template, or create something from scratch. For more information, visit my page **[custom design services page](http://pruvalcaba.com/)**.

## About

Portfolio-api is an open source library of free Bootstrap templates and themes. All of the free templates and themes on Portfolio-api are released under the MIT license, which means you can use them for any purpose, even for commercial projects.

Portfolio-api was created by and is maintained by **[Paulo C Ruvalcaba](http://pruvalcaba.com/)**.

* https://github.com/pcesarmx

## Copyright and License

Copyright 2013-2018. Code released under the [MIT](https://github.com/pcesarmx/portfolio-api/master/LICENSE) license.
