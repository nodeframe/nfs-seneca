import _ from 'lodash'

export function extractListenings(transportConfig = {}) {
	if (Array.isArray(transportConfig.listenings)) {
    const pinSet = transportConfig.listenings.map(m => m.pins)
    return _.reject(_.flatten(pinSet), _.isEmpty)
  }
  return []
}