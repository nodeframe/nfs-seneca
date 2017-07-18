import * as Module from '../src/module'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised'
import {SenecaMockup} from "./helper.test";
chai.use(chaiAsPromised).should()
import seneca from 'seneca';

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
      Module.registerHealthCheck(si, transportConfig)
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
      Module.registerHealthCheck(si, transportConfig)
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
      Module.registerHealthCheck(si, transportConfig)
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
      Module.registerHealthCheck(si, transportConfig)
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
      Module.registerHealthCheck(si, transportConfig)
      si.should.have.property('added')
        .of.length(2)
    })
  })

  it('should be able to act to healthcheck', (done) => {
    const transportConfig = {
      listenings: [
        {
          type: 'http',
          pins: [
            {role: 'role_1', cmd: '*'},
            {role: 'role_2', cmd: 'unrolled'}
          ],
          port: '8000'
        }
      ],
      disableHealthCheck: false,
      healthCheck: 'role_3'
    }
    let si = seneca()
    si.listen(transportConfig.listenings[0])
    Module.registerHealthCheck(si, transportConfig)

    let si2 = seneca()
    si2.client(transportConfig.listenings[0])

    si2.act({role: 'role_1', cmd: '_healthCheck'}, function(err, resp) {
      console.log('done', resp)
      if (err) done(err);
      resp.should.have.property('result').to.have.property('service').equal('role_1')
      done()
    })

  })
})