# Portfolio-API

* This module helps the **["contact me"](https://github.com/pcesarmx/portfolio/)** page to process the requests using nodejs or aws lambda functions.

## Preview (DEVEL)
![Portfolio Preview1](https://raw.githubusercontent.com/pcesarmx/portfolio-api/master/assets/preview1.png)

## Preview (PRODUCTION)
![Portfolio Preview1](https://raw.githubusercontent.com/pcesarmx/portfolio-api/master/assets/preview3.png)

**[View Live Preview using "Contact Page"](http://pruvalcaba.com/)**

## Status
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/pcesarmx/portfolio/master/LICENSE)

## Download and Installation
To begin using this module, choose one of the following options to get started:
* Clone the repo: 
 `git clone https://github.com/pcesarmx/portfolio-api.git`
* Install grunt (if you don't have it installed) 
 `npm i -g grunt` 
* Install project dependencies
 `npm i`

### Basic Usage
After download and install: 
* Edit or cretae a js file `/v1/{your_endpoint}/{your_endpoint}.js`.
* Edit or cretae a js file `/classes/{your_class}.js`.
* edit `_private_config.json` with your own (twilio / gmail settings) and rename the file to `private_config.json`
* Run the project
 `grunt`
* Open your web browser: localhost:5800

## Passing Parameters

* DEVEL
```
 {
    "action":"testapi",
    "name": "Albert Roberts",
    "phone": "5591112233",
    "email": "test@qq.com",
    "message": "Testing SMS and email"
 }
```
* PRODUCTION
 Calling `http://localhost:5800/{your_endpoint}` using `GET` or `POST` (Same parameter names that DEVEL)

### Advanced Usage
* After download and install, simply edit or cretae a json file `/v1/{your_endpoint}/_test.json` to perform your test.

![Portfolio Preview1](https://raw.githubusercontent.com/pcesarmx/portfolio-api/master/assets/preview2.png)

### Deploy to production
AWS Elasticbeanstalk Deploy:
* `eb init`
* `eb create [ENV_NAME]`
* `eb setenv DEV_ENV=production` 
    * Or all at once: `eb setenv DEV_ENV=production TWILIO_NUMBER=+1112223333 ... [all your config features]`
    * See `_private_config.json` and `config.js`
* `eb use [ENV_NAME]`
    * Remember to always commit your changed before `eb deploy`
* `eb deploy` or `eb deploy [ENV_NAME]`

AWS Lambda - GATEWAY Deploy:

* Coming Soon ...


***[See more info about EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb3-cmd-commands.html)***

#### Grunt Tasks

- `grunt` the default task that builds everything

## Bugs and Issues

Have a bug or an issue with this template? [Open a new issue](https://github.com/pcesarmx/portfolio-api/issues) here on GitHub.

## Custom Builds

You can hire Paulo to create a custom build of any template, or create something from scratch. 
For more information, **[visit my freelancer page](http://pruvalcaba.com/)**.

## About

Portfolio-api is an open source repository released under the MIT license, which means you can use them for any purpose, even for commercial projects.

Portfolio-api was created by and is maintained by **[Paulo C Ruvalcaba](http://pruvalcaba.com/)**.

* https://github.com/pcesarmx

## Copyright and License

Copyright 2013-2018. Code released under the [MIT](https://github.com/pcesarmx/portfolio-api/master/LICENSE) license.
