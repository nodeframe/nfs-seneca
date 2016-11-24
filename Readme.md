## Installation

```sh
npm install nfs-seneca --save
```

## Usage Example
You can declare a service with function,promise and async function

```javascript
import nfsSeneca from 'nfs-seneca';
const {add,act,si} = nfsSeneca(config.seneca.options,config.seneca.plugins);

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