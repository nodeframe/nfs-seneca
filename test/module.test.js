import * as Module from '../src/module'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised'
import {SenecaMockup, randomPort} from "./helper.test"
chai.use(chaiAsPromised).should()
import seneca from 'seneca'
import sinon from 'sinon'
import * as Wrapper from '../src/seneca-wrapper'

describe("Module", function () {
  context('#extractListenings', () => {
    it('should be able to extract all listenings pins', () => {
      const transportConfig = {
        listenings: [
          {
            type: 'http',
            pins: [
              {role: 'role_1', cmd: '*'},
              {role: 'role_2', cmd: 'a'}
            ]
          },
          {
            type: 'http',
            pins: [
              {role: 'role_3', cmd: '*'}
            ]
          }
        ]
      }
      Module.extractListenings(transportConfig).should.be.deep.equal([
        {role: 'role_1', cmd: '*'},
        {role: 'role_2', cmd: 'a'},
        {role: 'role_3', cmd: '*'}
      ])
    })
    it('should ignore undefined pin and empty pin set', () => {
      const transportConfig = {
        listenings: [
          {
            type: 'http'
          },
          {
            type: 'http',
            pins: [
              {role: 'role_3', cmd: '*'}
            ]
          },
          {
            type: 'haha',
            pins: []
          }
        ]
      }
      Module.extractListenings(transportConfig).should.be.deep.equal([
        {role: 'role_3', cmd: '*'}
      ])
    })
  })
  context('#_extractArrayOfPin', () => {
    it('should be able to extract array of pins', () => {
      Module._extractArrayOfPin([{
        pins: [{a: 'a1', b: 'b1'}, {a: 'a2', b: 'b2'}]
      }, {
        pins: [{a:'a3', b: 'b4'}]
      }]).should.be.deep.equal([{a: 'a1', b: 'b1'}, {a: 'a2', b: 'b2'}, {a:'a3', b: 'b4'}])
    })

    it('should be able to remove empty pins', () => {
      Module._extractArrayOfPin([{
        pins: [{a: 'a1', b: 'b1'}, {a: 'a2', b: 'b2'}]
      }, {
        pins: [{}]
      }]).should.be.deep.equal([{a: 'a1', b: 'b1'}, {a: 'a2', b: 'b2'}])
    })

    it('should return empty array if the parsed data is not iterable', () => {
      Module._extractArrayOfPin(undefined).should.be.deep.equal([])
    })
  })
  context('#registerHealthCheck', () => {
    it('should be able to register health check according to pin', () => {
      const transportConfig = {
        listenings: [
          {
            type: 'http',
            pins: [
              {role: 'role_1', cmd: '*'}
            ]
          },
          {
            type: 'http',
            pins: [
              {role: 'role_2', cmd: '*'}
            ]
          }
        ]
      }
      let si = new SenecaMockup()
      Module.registerHealthCheck({si}, transportConfig)
        si.should.have.property('added')
        .of.length(2)
    })

    it('should not add any health check if it was disable in transportConfig', () => {
      const transportConfig = {
        listenings: [
          {
            type: 'http',
            pins: [
              {role: 'role_1', cmd: '*'},
              {role: 'role_2', cmd: '*'}
            ]
          }
        ],
        disableHealthCheck: true
      }
      let si = new SenecaMockup()
      Module.registerHealthCheck({si}, transportConfig)
      si.should.have.property('added')
        .of.length(0)
    })

    it('should not add health check to role that is not cmd:*', () => {
      const transportConfig = {
        listenings: [
          {
            type: 'http',
            pins: [
              {role: 'role_1', cmd: '*'},
              {role: 'role_2', cmd: 'unrolled'}
            ]
          }
        ],
        disableHealthCheck: false
      }
      let si = new SenecaMockup()
      Module.registerHealthCheck({si}, transportConfig)
      si.should.have.property('added')
        .of.length(1)
    })

    it('should add more additional health check on manual specify role', () => {
      const transportConfig = {
        listenings: [
          {
            type: 'http',
            pins: [
              {role: 'role_1', cmd: '*'},
              {role: 'role_2', cmd: 'unrolled'}
            ]
          }
        ],
        disableHealthCheck: false,
        healthCheck: ['role_3', 'role_4']
      }
      let si = new SenecaMockup()
      Module.registerHealthCheck({si}, transportConfig)
      si.should.have.property('added')
        .of.length(3)
    })

    it('should be able to register additional health check if specified in string', () => {
      const transportConfig = {
        listenings: [
          {
            type: 'http',
            pins: [
              {role: 'role_1', cmd: '*'},
              {role: 'role_2', cmd: 'unrolled'}
            ]
          }
        ],
        disableHealthCheck: false,
        healthCheck: 'role_3'
      }
      let si = new SenecaMockup()
      Module.registerHealthCheck({si}, transportConfig)
      si.should.have.property('added')
        .of.length(2)
    })
  })

  context('#paseOption', () => {
    it('should be able to parse option timeout to number', () => {
      const options = {
        timeout: "50000"
      }

      Module.parseOption(options).timeout.should.be.an('number');
    })
  })

  context('#healthCheckClientService', () => {
    it('should be able to healthcheck all', () => {
      const transportConfig = {
        listenings: [
          {
            type: 'http',
            pins: [
              {role: 'role_1', cmd: '*'},
              {role: 'role_2', cmd: 'unrolled'}
            ],
            port: randomPort()
          }
        ],
        clients: [
          {
            pins: [
              {role: 'role_a', cmd: '*'},
              {role: 'role_b', cmd: '*'}
            ]
          }
        ],
        disableHealthCheck: false,
        healthCheck: 'role_3'
      }
      let si = seneca()
      let actStub = sinon.stub().resolves({ok: true, result: {timestamp: new Date(), service: 'by_sinon'}})

      return Module.healthCheckClientService({si, act: actStub}, transportConfig)
        .then((results)=>{
          actStub.withArgs({role: 'role_a', cmd: '_healthCheck', recursive: false}).calledOnce.should.be.true
          actStub.withArgs({role: 'role_b', cmd: '_healthCheck', recursive: false}).calledOnce.should.be.true
        })

    })
  })

  context('should be able to act to healthCheck', () => {
    it('on a none-recursive system', (done) => {
      const transportConfig = {
        listenings: [
          {
            type: 'http',
            pins: [
              {role: 'role_1', cmd: '*'},
              {role: 'role_2', cmd: 'unrolled'}
            ],
            port: randomPort()
          }
        ],
        disableHealthCheck: false,
        healthCheck: 'role_3'
      }
      let si = seneca()
      si.listen(transportConfig.listenings[0])
      Module.registerHealthCheck({si}, transportConfig)

      let si2 = seneca()
      si2.client(transportConfig.listenings[0])

      si2.ready(function(){
        si2.act({role: 'role_1', cmd: '_healthCheck'}, function(err, resp) {
          console.log('done', resp)
          if (err) done(err);
          resp.should.have.property('result').to.have.property('service').equal('role_1')
          done()
        })

      })

    })

    context('on recursive system', () => {
      it('success case', (done) => {
        const port1 = randomPort()
        const port2 = randomPort()
        const transportConfig = {
          listenings: [
            {
              type: 'http',
              pins: [
                {role: 'role_1', cmd: '*'},
                {role: 'role_2', cmd: 'unrolled'}
              ],
              port: port1
            }
          ],
          clients: [
            {
              pins:[
                {role: 'role_a', cmd: '*'},
                {role: 'role_b', cmd: '*'}
              ],
              port: port2
            }
          ],
          disableHealthCheck: false,
          healthCheck: 'role_3'
        }
        let si = seneca()
        si.listen(transportConfig.listenings[0])
        si.client(transportConfig.clients[0])
        Module.registerHealthCheck({si, act: Wrapper.actGenerator(si)}, transportConfig)

        let si2 = seneca()
        si2.listen(transportConfig.clients[0])
        Module.registerHealthCheck({si: si2, act: Wrapper.actGenerator(si2)}, {listenings: transportConfig.clients})

        let si3 = seneca()
        si3.client(transportConfig.listenings[0])

        si3.ready(function(){
          si3.act({role: 'role_1', cmd: '_healthCheck'}, function(err, resp) {
            console.log('done', resp)
            if (err) done(err);
            resp.should.have.property('result').to.have.property('serviceClients')
            done()
          })

        })

      })
      it('error case', (done) => {
        const port1 = randomPort()
        const port2 = randomPort()
        const transportConfig = {
          listenings: [
            {
              type: 'http',
              pins: [
                {role: 'role_1', cmd: '*'},
                {role: 'role_2', cmd: 'unrolled'}
              ],
              port: port1
            }
          ],
          clients: [
            {
              pins:[
                {role: 'role_a', cmd: '*'},
                {role: 'role_b', cmd: '*'}
              ],
              port: port2
            }
          ],
          disableHealthCheck: false,
          healthCheck: 'role_3'
        }
        let si = seneca()
        si.listen(transportConfig.listenings[0])
        si.client(transportConfig.clients[0])
        Module.registerHealthCheck({si, act: Wrapper.actGenerator(si)}, transportConfig)

        let si2 = seneca()
        si2.listen(transportConfig.clients[0])
        // No matching pattern for this _healthCheck


        let si3 = seneca()
        si3.client(transportConfig.listenings[0])

        si3.ready(function(){
          si3.act({role: 'role_1', cmd: '_healthCheck'}, function(err, resp) {
            err.should.not.be.null
            done(resp)
          })

        })

      })
    })
  })

  context('#logHealthCheck', () => {
    let logSpy
    before(() => {
      logSpy = sinon.spy(console, "log")
    })
    afterEach(() => logSpy.reset())
    it("should log out if the logHealthCheckPulse is true", () => {
      Module.logHealthCheck({logHealthCheckPulse: "true"}, "hello")
      logSpy.calledOnce.should.be.true
    })
    it("should not log out if the logHealthCheckPulse is not true", () => {
      Module.logHealthCheck({logHealthCheckPulse: "false"}, "hello")
      logSpy.notCalled.should.be.true
    })

    it("should be able to pass arguments to console.log", () => {
      Module.logHealthCheck({logHealthCheckPulse: "true"}, "hello", "this", "is", "a", "book")
      logSpy.calledWith("hello", "this", "is", "a", "book").should.be.true
    })

  })
})