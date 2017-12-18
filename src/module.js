import _ from 'lodash'
import Promise from 'bluebird'

const HEALTH_CHECK_CMD = '_healthCheck'

export function extractListenings(transportConfig = {}) {
	return _extractArrayOfPin(transportConfig.listenings)
}

export function _extractArrayOfPin(arr) {
  if (Array.isArray(arr)) {
    const output = arr.map(m => m.pins)
    return _.reject(_.flatten(output), _.isEmpty)
  }
  return []
}

export function registerHealthCheck(seneca, transportConfig = {}) {
  console.log('=====##### Register HealthCheck ####=====')
  if(transportConfig.disableHealthCheck) {
    return
  }
  const pins = extractListenings(transportConfig)
  pins.forEach((p) => {
    // this will add healthCheck on only * pins
    if (p.cmd === '*') {
      addHealthCheck(seneca, p.role, transportConfig)
    }
  })
  if(transportConfig.healthCheck) {
    if (Array.isArray(transportConfig.healthCheck)) {
      _.uniq(transportConfig.healthCheck).forEach((role) => {
        addHealthCheck(seneca, role, transportConfig)
      })
    }
    if (typeof transportConfig.healthCheck === 'string') {
      addHealthCheck(seneca, transportConfig.healthCheck, transportConfig)
    }
  }
  console.log('=====##############################=====')
}

function addHealthCheck(seneca, serviceName, transportConfig = {}) {
  const serviceObject = {role: serviceName, cmd: HEALTH_CHECK_CMD}
  console.log('assign health check', serviceObject)
  seneca.si.add(serviceObject, function(args, done) {
    logHealthCheck(transportConfig, `run healthcheck on role: ${serviceName} with recursive ${args.recursive}`)
    if (args.recursive == false) {
      done(null, {ok: true, result: {timestamp: new Date(), service: serviceName}})
    } else {
      healthCheckClientService(seneca, transportConfig)
        .then((results)=>{
          done(null, {ok: true, result: {timestamp: new Date(), service: serviceName, serviceClients: results}})
        }).catch((e) => {
          done(e)
      })
    }

  })
}


export function parseOption(options = {}) {
  if(options.timeout) {
    options.timeout = parseInt(options.timeout, 10)
  }
  return options
}

/**
 * This method will gather all the client services that this service will consume
 * The method will log out health check output on each role
 */
export function healthCheckClientService(seneca, transportConfig = {}) {
  let clients = _extractArrayOfPin(transportConfig.clients)
  logHealthCheck(transportConfig, 'run healthcheck resursively to: ', clients.map((c) => c.role).join(','))
  return Promise.map(clients, function(pin) {
    return seneca.act({role: pin.role, cmd: HEALTH_CHECK_CMD, recursive: false})
      .then((result)=>{
        logHealthCheck(transportConfig, result.service, 'is available at', result.timestamp)
        return {success: true, result}
      }).catch((e) => {
        console.log('Error on service', pin.role, 'of detai: ', e.message)
        return {success: false, e}
      })
  }).then((results)=>{
    if (_.every(results, 'success')) {
      // all success
      return results
    } else {
      // not all success
      const e = new Error("Not all service is available")
      e.detail = results
      throw e
    }
  })

}

export function logHealthCheck(transportConfig, ...args) {
  if (transportConfig.logHealthCheckPulse === "true") {
    console.log(...args)
  }
}

