import seneca from 'seneca';
import {register} from './register';
import * as Mesh from './plugin/mesh';
import * as Module from "./module";
import * as Wrapper from './seneca-wrapper';

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

  Module.registerHealthCheck({si, act, add}, transportConfig)

  return {act, add, si};
};