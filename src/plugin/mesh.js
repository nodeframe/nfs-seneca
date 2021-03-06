import _ from 'lodash'
import * as Module from '../module'

export function init(seneca, transportConfig = {}, ...args) {
	let pins = Module.extractListenings(transportConfig)

  if(!_.isEmpty(transportConfig.consul)) {
  	seneca.use('consul-registry', {
    	host: transportConfig.consul.host
  	})
  	console.log("Register consul host at", transportConfig.consul.host)
  }
  console.log("Register mesh with config", transportConfig.mesh)
  if (_.isEmpty(transportConfig.mesh)) {
  	throw new Error("transportConfig.mesh should not be empty")
  }
  console.log("on pin ==>", pins)
  let meshOption = {
  	host: transportConfig.mesh.host,
    port: transportConfig.mesh.port ||39999,
    listen:[...pins],
    bases:transportConfig.mesh.bases,
    discover:{
      registry:{
        active: true
      },
      multicast:{
        active: false
      }
    }
  }
  meshOption = _.merge(transportConfig.mesh.option, meshOption)
  console.log("initilize mesh with", meshOption)
  seneca.use('mesh', meshOption)
  .ready(function() {
  	console.log("starting mesh with base", this.id)
  })
  return seneca

}