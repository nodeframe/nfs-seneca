import seneca from 'seneca';
import Promise from 'bluebird';

const serializeError = (e)=>{
  return {name:e.name,stack:e.stack,message:e.message,errors: e.errors};
}

const deserializeError = (oe)=>{
  const e = new Error(oe.message);
  e.name = oe.name;
  e.errors = oe.errors;
  e.stack = oe.stack;
  return e;
}

export default function(seneca_options,config){
  const si = seneca(seneca_options);

  const act = (args) =>{
    return new Promise((resolve,reject)=>{
      si.act(args,function(err,resp){
        if(err){ reject(err); return; }
        else if(!resp.ok) reject(deserializeError(resp.error));
        else resolve(resp.result);
      });
    });

  }

  const add = (options,callback)=>{
    si.add(options,function(args,done){
      try{
        if(callback.length>=2){
          callback.bind(si)(args,done);
        }else{
            const resultWithArgs = callback.bind(si)(args);
            const isThenable = ('function' === typeof resultWithArgs.then);
            if(isThenable){
              resultWithArgs.then((response)=>{
                done(null,{ok:true,result:response});
              }).catch((e)=>{
                done(null,{ok:false,error:serializeError(e)});
              });
            }else{
              done(null,{ok:true,result:resultWithArgs});
            }
        }
      }catch(e){
        done(null,{ok:false,error:serializeError(e)});
        return;
      }
    })
  };

  if(config && config.listenings){
    config.listenings.reduce((prev,curr)=>{
      return prev.listen(curr);
    },si);
  }

  if(config && config.clients){
    config.clients.reduce((prev,curr)=>{
      return prev.client(curr);
    },si);
  }

  return {act,add,si};
};