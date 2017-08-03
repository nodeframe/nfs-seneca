import _ from 'lodash'

export function extractListenings(transportConfig = {}) {
	if (Array.isArray(transportConfig.listenings)) {
    const pinSet = transportConfig.listenings.map(m => m.pins)
    return _.reject(_.flatten(pinSet), _.isEmpty)
  }
  return []
}

export function registerHealthCheck(seneca, transportConfig = {}) {
  if(transportConfig.disableHealthCheck) {
    return
  }
  const pins = extractListenings(transportConfig)
  pins.forEach((p) => {
    // this will add healthCheck on only * pins
    if (p.cmd === '*') {
      addHealthCheck(seneca, p.role)
    }
  })
  if(transportConfig.healthCheck) {
    if (Array.isArray(transportConfig.healthCheck)) {
      _.uniq(transportConfig.healthCheck).forEach((role) => {
        addHealthCheck(seneca, role)
      })
    }
    if (typeof transportConfig.healthCheck === 'string') {
      addHealthCheck(seneca, transportConfig.healthCheck)
    }
  }
}

function addHealthCheck(seneca, serviceName) {
  const serviceObject = {role: serviceName, cmd: '_healthCheck'}
  console.log('assign health check', serviceObject)
  seneca.add(serviceObject, function(args, done) {
    done(null, {ok: true, result: {timestamp: new Date(), service: serviceName}})
  })
}


export function parseOption(options = {}) {
  if(options.timeout) {
    options.timeout = parseInt(options.timeout, 10)
  }
  return options
}