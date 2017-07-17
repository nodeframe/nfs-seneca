import chai from 'chai';
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised).should()
import _ from 'lodash'

import * as Mesh from '../../src/plugin/mesh'

describe('mesh plugin', function () {
  let baseConfig = {
    transports: {
      type: "mesh",
      listenings: [
        {
          type: 'http',
          pins: [
            {role: 'servicea', cmd: '*'}
          ],
          port: '8000',
          timeout: 30000
        }
      ],
      clients: [
        {
          type: 'http',
          pins: [
            {role: 'client_of_me', cmd: '*'}
          ],
          port: '8000',
          host: 'client_of_me',
          timeout: 30000
        }
      ],
      consul: {
        host: 'consul'
      },
      mesh: {
        host: 'mesh-host',
        bases: ['mesh-bases:39999']
      }
    },
  }
  context('#init', () => {
    it('should be able to register config into mesh config', () => {
      let moq = new SenecaMuckup()
      Mesh.init(moq, baseConfig.transports)
      _.filter(moq.register, ['name', 'mesh'])[0]
        .should.have.property('object')
        .to.be.deep.equal({
          host: 'mesh-host',
          pins: [{role: 'servicea', cmd: '*'}],
          bases: ['mesh-bases:39999'],
          discover: {
            registry: {
              active: true
            },
            multicast: {
              active: false
            }
          }
      })
    })
  })

})

class SenecaMuckup {
  constructor(r = []) {
    this.register = r
  }

  use(name, object) {
    this.register.push({
      name, object
    })
    return this
  }

  ready(f) {
    this.register.push({
      name: 'ready', object: f
    })
    return this
  }
}