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
    done(null, {ok: true, result: {timestamp: new Date(), service: serviceName}})
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
  return Promise.map(clients, function(pin) {
    return seneca.act({role: pin.role, cmd: HEALTH_CHECK_CMD})
  })
  
}