Seneca wrapper for ES6 and promise application

Create and maintain by _[Nodeframe Solution](www.nf-solution.com)_

Contact us at support@nf-solution.com

*NOTE:* This lib had been migrated from [nfs-seneca](https://www.npmjs.com/package/nfs-seneca) which is officially depreciated. The development and maintenance will continue solely on this repo.

## Installation

```sh
npm install @nodeframe/seneca --save
```

## Usage

import

```javascript
import nfsSeneca from '@nodeframe/seneca';
```

declare the seneca using this syntax

```javascript
const {add, act, si} = nfsSeneca(option, transportConfig)
```

The last value `si` is the seneca object itself returned from the seneca initialization.

the implementation of `si` object is like so

```javascript
  const si = seneca(option)
```

and it simply return out for you to use, you can still use `si.use()`, `si.client()`, or `si.listen()` as same as you would use with the official seneca object

The `add` and `act` is simply the wrapped version of `si.add` and `si.act`

## Usage Example
You can declare a service with function,promise and async function

```javascript
import nfsSeneca from '@nodeframe/seneca';
const {add,act,si} = nfsSeneca(config.seneca.options, config.seneca.transport);

add({...}, (args,done) => {
    done(null,{role:'With Done'});
});

add({...}, (args) => {
  return Promise.resolve('resolved');
});

add({...}, (args) => {
  return {role:'With Return'};
});

add({...}, async (args){
  return await p1();
});
```

## Config
There's two type of config that should be pass upon initialization

The first part is the seneca option passed to the seneca initialization. This config will be passed directly to the official seneca initialization. The `transportConfig` is where all the magic happen.

the transport config can be like this

```javascript
transports: {
 listenings: [
   {
     type: 'http',
     pins: [
       { role: 'portals', cmd: '*' }
     ],
     port: '8000',
     timeout: 30000
   }
 ],
 clients: [
   {
     type: 'http',
     pins: [
       { role: 'serviceX', cmd: '*'}
     ],
     port: '8000',
     host: process.env.APPLICATION_SERVICE || 'application_service',
     timeout: 30000
   },
   {
     type: 'http',
     pins: [
       { role: 'serviceY', cmd: '*' }
     ],
     port: '8000',
     host: process.env.USER_SERVICE || 'user_service',
     timeout: 30000
   }
 ]
}
```

note that this config is compatible with seneca plugins as well, for example you can use `seneca-amqp-transport` plugin (note that this plugin must be `npm install` on your main project in order to get this to work)

The example of this `amqp` transport config can be like so

```javascript
transports: {
  listenings: [],
  clients: [
   {
     type: 'amqp',
     timeout: 5000,
     pins: [
       { role: 'USER', cmd: '*' },
       { role: 'permalinkSubmission', cmd: '*' }
     ],
     url: process.env.AMQP_URL || 'amqp://guest:guest@128.199.105.153:5672'
   }
  ]
 uses: ['seneca-amqp-transport']
}
```

The `seneca.use('seneca-amqp-transport')` will be run upon initialization by this library.

### Plugin

The other seneca plugin that require more initialization step shall be declared in this package, currently we have several plugin that capable for initialization simply by pushing config file to this setup (of course, you still need to `npm install` the plugin into the main project as well)

#### Mesh

This plugin will use kubernetes `mesh` for seneca

These npm seneca plugins are required for this plugin to work
```
"seneca-balance-client":
"seneca-consul-registry"
"seneca-mesh"
```

The mesh initialization on seneca must be run in this manner

```javascript
seneca
  .use('consul-registry',{
    host: 'consul-host'
  })
  .use('mesh',{
    pins:[ //listening role
      'role:a',
      'role:b',
      'role:c',
    ],
    host:'host-name-for-this-service',
    bases:[
      'base-service-host:39999'
    ],
    discover:{
      registry:{
        active: true
      },
      multicast:{
        active: false
      }
    } //other option here
  })
  .ready(function(){
    //ready function
  })
```

To avoid duplicate code on your seneca initialization, these setting shall settle in your config only

```javascript
const config = {
  transports: {
    type: 'mesh',
    listenings: [
      {
        pins: [
          { role: 'a', cmd: '*' },
          { role: 'b', cmd: '*' },
          { role: 'c', cmd: '*' }
        ]
      }
    ],
    clients: [],
    consul: {
      host: 'consul-host'
    },
    mesh: {
      host: 'host-name-for-this-service',
      bases: ['base-service-host:39999']
    },
    option: {
      //option in this will be merged
      discover:{
        registry:{
          active: true
        },
        multicast:{
          active: false
        }
      }
    }
  }
}
```

notice the `mesh.host` is the mandatory field that should specify about this service host name so that other service can connect to this service. The bases array is the base center service according to mesh architecture.

## HealthCheck

It is important for seneca service to check if the other service to call is available or not. On the contrary, each service should provide a simple health checking for other servie to check if the communication can be made. This will help savign quite some time during debugging process.

`@nodeframe/seneca` try to add a mean to handle this problem. When you pass the config into `@nodeframe/seneca`, it will automatically read which listening pins this current service provides. It then create another special `add` for each pins.

For example, passing this config to `@nodeframe/seneca`

```javascript
const seneca = nfsSeneca({}, {
  listenings: [
    {
      type: 'http',
      pins: [
        { role: 'a', cmd: '*' },
        { role: 'b', cmd: '*' },
        { role: 'c', cmd: 'cee' }
      ]
    }
  ],
  clients: [
    {
      type: 'http',
      pins: [{role: 'd', cmd: '*'}]
    }
  ]
})
```

passing this, the health check function will be registered to these pins

```javascript
{ role: 'a', cmd: '_healthCheck' }
{ role: 'b', cmd: '_healthCheck' }
```

for other service you can ping to check if this service is online by running this

```javascript
seneca.act({role: 'a', cmd: '_healthCheck'}, function(err, response) {
  console.log(response.result)
  //will return {timestamp: <<the current time>>, service: 'a'}
})

```

_**Note**_ that `role: c` will not register any healthCheck because it could not be sure that all the pins will come into this service, hence there could be clashes on `_healthCheck` method. Moreover, note that the `role: d` will not be registered also sine it is a service that _this_ current service will consume (not the provider).

To add manual health check to this service, you can do it by sending `healthCheck` config like so

```javascript
const seneca = nfsSeneca({}, {
  healthCheck: ['a', 'b']
})
```

doing this will add `cmd: _healthCheck` to role `a` and `b`

Lastly, if you are not interested in the health check, you can disable it by passing

```javascript
const seneca = nfsSeneca({}, {
  disableHealthCheck: true
})
```

#### HealthCheck Log Pulse
if you want to see the log pulse of `_healthCheck`, you should pass


```javascript
const seneca = nfsSeneca({}, {
  logHealthCheckPulse: "true"
})
```

with this, your application will log something like this every health check pulse

```sh
run healthcheck resursively to:  payment,MAIL,property,USER,TASK,portals

USER is available at 2017-12-11T21:37:06.691Z

TASK is available at 2017-12-11T21:37:06.691Z

MAIL is available at 2017-12-11T21:37:06.691Z

payment is available at 2017-12-11T21:37:06.692Z

property is available at 2017-12-11T21:37:06.692Z

portals is available at 2017-12-11T21:37:06.695Z
```

### Ping function

to help you debug the service, we develop a ping function that can pass the same config and ping to the client service

```javascript
var ping = require('@nodeframe/seneca/libs/tool').getPing(senecaOption, transportConfig)
```

then, this function can be used to call to health check on the specify service

```javascript
ping('a').then(function(resp) {
  console.log("resp=", resp)
})
```
will call to service `a`
