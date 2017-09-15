import seneca from 'seneca';
import {register} from './register';
import * as Mesh from './plugin/mesh';
import * as Module from "./module";
import * as Wrapper from './seneca-wrapper';
import {healthCheckClientService} from "./module";

export default function (senecaOptions, transportConfig = {}) {
  const si = seneca(Module.parseOption(senecaOptions));

  const act = Wrapper.actGenerator(si)

  const add = Wrapper.addGenerator(si)

  switch (transportConfig.type) {
    case 'mesh':
      console.log("nfs-seneca mesh mode!")
      Mesh.init(si, transportConfig)
      break
    default:
      console.log("nfs-seneca normal mode")
      register(si, transportConfig)
      break
  }

  // Register health check to the seneca
  Module.registerHealthCheck({si, act, add}, transportConfig)

  //run initial health check on seneca start
  si.ready(function(arg){
    console.log(`service ID [${this.id}] has been ready  ...`)
    if( process.env.NO_CLIENT_HEALTHCHECK_TEST!=="true" ) {
      console.log('============= START INITIAL HEALTHCHECK =================')
      healthCheckClientService({act}, transportConfig)
        .catch((e) => {
          console.error(e)
          console.log('!!!!! NOT ALL SERVICE IS ALIVE !!!!!!!')
        }).finally(() => {
          console.log('============= END INITIAL HEALTHCHECK =================')
      })

    }
  })


  return {act, add, si};
};