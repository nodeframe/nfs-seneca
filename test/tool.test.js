import chai from 'chai';
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised).should()
import seneca from 'seneca'
import * as Tool from '../src/tool'
import {randomPort} from "./helper.test";

describe("Tool", function(){
  context('#getPing', () => {
    it('should be able to return working ping function', () => {

      const transportConfig = {
        clients: [
          {
            type: 'http',
            pins: [
              {role: 'role_1', cmd: '*'},
              {role: 'role_2', cmd: 'unrolled'}
            ],
            port: randomPort(),
            host: 'localhost',
            timeout: 3000
          }
        ],
        listenings: []
      }

      const si = seneca()
      si.listen(transportConfig.clients[0])
      si.add({role: 'role_1', cmd: '_healthCheck'}, function(args, done) {
        done(null, {ok: true, result: {timestamp: new Date(), service: 'role_1'}})
      })

      const ping = Tool.getPing({}, transportConfig)
      return ping('role_1')
        .should.eventually.have.property('timestamp')
    })
  })
})