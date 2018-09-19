# API

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
* Create the file [**`private_config.json`**](#configuration-settings) with your own twilio, gmail and AWS settings.
    **You can use**  `_private_config.json` **as a base example**.
* Run the project
 `grunt`
* Open your web browser: localhost:5800

## Test Parameters
* ### DEVEL
```
 {
    "action":"testapi",
    "name": "Albert Roberts",
    "phone": "5591112233",
    "email": "test@qq.com",
    "message": "Testing SMS and email"
 }
```
* ### PRODUCTION
Calling `http://localhost:5800/{your_endpoint}` using `GET` or `POST` (Same parameter names that DEVEL)


## Configuration Settings
* The file `private_config.json` will contain all the API Keys, credentials, production params that supports the implementation. 
* **This file will be ignored on the repository**.

[id]: configuration-settings "Configuration Settings"
```
{
    "TWILIO": {
        "NUMBER": "+15591112222",
        "ACC_SID": "YOUR_TWILIO_ACC_SID",
        "TOKEN": "YOUR_TWILIO_TOKEN"
    },
    "GMAIL": {
        "USER": "youremail@gmail.com",
        "PASS": "YOUR_PASSWORD",
        "CC": "optional emails separates by `,`"
    },
    "APIGATEWAY": {
        "swagger": "2.0",
        "region": "us-west-2",
        "account": "aws_acc_number",
        "lambda": "lambda_name",
        "lambda_version": false,
        "lambda_runtime": "nodejs8.10",
        "lambda_role": "arn:aws:iam::[account]:role/[awsrole]",
        "lambda_handler_name": "handler",
        "lambda_timeout_sec": "10",
        "version": "default",
        "base_path": "default",
        "schemes": ["http", "https"],
        "swagger_host": "http://localhost:5800/swagger/",
        "deploy_cmds": {
            "cmd_custom_copy_dirs": [],
            "cmd_custom_copy_files": ["README.md"]
        }
    }
}
```
__Note:__ You can also protect your deploy by overwriting your production settings on production enviroment. See [Advanced Usage](#overwrite-production-settings)


### Deploy to production using **AWS**
##### **Elasticbeanstalk Deploy:**
[id]: elasticbeanstalk-deploy "Configuration Settings" 
* Install **The Elastic Beanstalk Command Line Interface (EB CLI)[^ebcli]**
* `eb init`
* `eb create [ENV_NAME]`
* `eb setenv DEV_ENV=production` 
    * Or all at once: `eb setenv DEV_ENV=production TWILIO_NUMBER=+1112223333 ... [all your config features]`
    * See `_private_config.json` and `config.js`
* `eb use [ENV_NAME]`
    * Remember to always commit your changes before `eb deploy`
* `eb deploy` or `eb deploy [ENV_NAME]`
_See more info about EB CLI_ [here](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb3-cmd-commands.html)

##### **Lambda - GATEWAY Deploy:**
* Be sure all your references on [the Configuration file](#configuration-settings) are matching your aws settings **(APIGATEWAY settings)**.
* Edit `apigateway.swagger.config.json`
```
{
    "host": "execute-api.us-west-2.amazonaws.com",
    "resources": [{
        "path": "/",
        "requestTemplate": {}
    }, {
        "path": "/contactme",
        "requestTemplate": {
            "_operation": "portfolio/portfolio",
            "action": {
                "required": true,
                "type": "string",
                "description": "Do not change the value",
                "default": "testapi"
            },
            "name": {
                "type": "string",
                "required": true,
                "description": "Name of the person is contacting."
            },
            "phone": {
                "type": "string",
                "required": true,
                "description": "Phone of the person is contacting."
            },
            "email": {
                "type": "string",
                "required": true,
                "description": "Email of the person is contacting."
            },
            "message": {
                "type": "string",
                "required": true,
                "description": "Message to send."
            }
        }
    }]
}
```
* Parameter details:
    * **host**: AWS REST BASE URL `execute-api.us-west-2.amazonaws.com`
    * **resources** {Array of Resources} : API endpoints layout definition
        * **path** : Public api endpoint path when it is deployed.
        * **requestTemplate** : Parameters to use in lambda function.
        * **_operation** : Link to the endpoint source name.
        * **`action,name,phone,email and messsage ...`**: Custom parameters according your implementation.
* Run `grunt build-api --deploy-all`. 

    If everithing is OK you will be able to see your API on aws:

![Portfolio Preview1](https://raw.githubusercontent.com/pcesarmx/portfolio-api/master/assets/preview4.png)
* **You can also see [all Grunt task here](#grunt-tasks)**

## Advanced Usage
##### **TESTING**
After download and install, simply edit or cretae a json file `/v1/{your_endpoint}/_test.json` to perform your test.
```
/*  You can use comments in this JSON file */
{
    "delay_ms": 1000,
    "tests": [{
        // Add custom flags to use in lib/server-utils.js: performTest(t)
        // "enabled": false,
        "event": {
            "mode": "keepalive",
            "action": "testapi",
            "name": "Albert Roberts",
            "phone": "5591112233",
            "email": "test@qq.com",
            "message": "Testing SMS and email"
        }
    }, {
        "enabled": true,
        "event": {
            "mode": "keepalive",
            "action": "testapi",
            "name": "Mario Stone",
            "phone": "3334445555",
            "email": "test@test2.com",
            "message": "Testing SMS and email"
        }
    }]
}
```
Running Example:
![Portfolio Preview1](https://raw.githubusercontent.com/pcesarmx/portfolio-api/master/assets/preview2.png)

##### **OVERWRITE Production Settings**:
[id]: overwrite-production-settings "Overwriting Settings"
The `config.js` file can be modified:
```
...
if (ENV.environment === 'production') {
        // Overwrite settings
        ENV.TWILIO.NUMBER = process.env.TWILIO_NUMBER || ENV.TWILIO.NUMBER;
        ENV.TWILIO.ACC_SID = process.env.TWILIO_ACC_SID || ENV.TWILIO.ACC_SID;
        ENV.TWILIO.TOKEN = process.env.TWILIO_TOKEN || ENV.TWILIO.TOKEN;

        ENV.GMAIL.USER = process.env.GMAIL_USER || ENV.GMAIL.USER;
        ENV.GMAIL.PASS = process.env.GMAIL_PASS || ENV.GMAIL.PASS;
        ENV.GMAIL.CC = process.env.GMAIL_CC || ENV.GMAIL.CC;
    }
...
```
Remember to set **DEV_ENV=Production** and the custom Environment Variables as [AWS Elasticbeanstalk Deploy](#elasticbeanstalk-deploy)  indicates.

_Important Note:_ **This functionality only applies for **Elasticbeanstalk**.

## Grunt Tasks
[id]: grunt-tasks
- `grunt` the default task that builds everything
- `grunt build-api` generates all dependencies to deploy in a Serverless[^serverless] Approach using **AWS Lambda - API Gateway** [^awslambda]
    - `--deploy` will deploy the endpoints to the REST GATEWAY only. 
    - `--deploy-all` will deploy the endpoints, lambda function and will setup the execution rights.  
- `grunt remove-api` deletes the deployed resources in AWS.
    - `--api` will delete the REST GATEWAY only.
    - `--all` will delete all on AWS regarding the API deploy.

# Custom Libraries 
## Twilio
- `sendsms (params)`

###### params: Object
   
```
{
    mobile: string 
}
```

## G-Mail

- `send (params)`

###### params: Object
   
```
{
    from: string | config.USER,
    to: string,
    cc: string | config.cc,
    subject: string,
    body: string | 'hello world!'
}
```


## Firebase

Setup your own firebase settings on [**`private_config.json`**](#configuration-settings) and [Firebase Doc](https://firebase.google.com/docs/admin/setup)

### Functions: 
- `isExistingApp (name)` -- `returns` boolean
- `generateToken(name, uid, data)` -- returns `promise`
- `listen (path, on_event, callback)` -- returns `promise`
- `read (path)` -- returns `promise`
- `update (path, snapshot)` -- returns `promise`
- `write (path, snapshot)` -- returns `promise`
- `push (path, snapshot)` -- returns `promise`
- `remove (path)` -- returns `promise`
- `findBy (path, key, value, bypass)` -- returns `promise`

## Bugs and Issues

Have a bug or an issue with this template? [Open a new issue](https://github.com/pcesarmx/portfolio-api/issues) here on GitHub.

## Custom Builds

You can hire Paulo to create a custom build of any template, or create something from scratch. 
For more information, **[visit my freelancer page](http://pruvalcaba.com/)**.

## About

API is an open source repository released under the MIT license, which means you can use them for any purpose, even for commercial projects.

API was created by and is maintained by **[Paulo C Ruvalcaba](http://pruvalcaba.com/)**.

* https://github.com/pcesarmx

## Copyright and License

Copyright 2013-2018. Code released under the [MIT](https://github.com/pcesarmx/portfolio-api/blob/master/LICENSE) license.


## References
* [Twilio © - Programmable SMS Service](https://www.twilio.com/sms)
* [Google Mail © - E-mail Service](https://mail.google.com/)
* [Amazon Web Services ©](https://aws.amazon.com/) 
* [The Elastic Beanstalk Command Line Interface (EB CLI)](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html) 
* [AWS Lambda](https://aws.amazon.com/lambda/) 
* [Serverless computing](https://en.wikipedia.org/wiki/Serverless_computing#Serverless_runtimes) 
