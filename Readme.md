Seneca wrapper for ES6 and promise application

Create and maintain by _[Nodeframe Solution](www.nf-solution.com)_

Contact us at support@nf-solution.com

## Installation

```sh
npm install nfs-seneca --save
```

## Usage

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
import nfsSeneca from 'nfs-seneca';
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
