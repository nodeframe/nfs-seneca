import seneca from 'seneca';
import Promise from 'bluebird';
import register from './register';
import * as Mesh from './plugin/mesh';

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

export default function(senecaOptions, transportConfig = {}){
  const si = seneca(senecaOptions);

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
  }

  switch(transportConfig.type) {
    case 'mesh':
      console.log("nfs-seneca mesh mode!")
      Mesh.init(si, transportConfig)
    default:
      console.log("nfs-seneca normal mode")
      register(si)
      break;
  }

  return {act,add,si};
};