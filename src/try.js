var Seneca = require('seneca');
var transportConfig = {
  clients: [
    {
      type: 'http',
      pins: [
        {role: 'role_1', cmd: '*'},
        {role: 'role_2', cmd: 'unrolled'}
      ],
      port: '8000',
      host: 'localhost',
      timeout: 3000
    }
  ],
  listenings: []
}

var si = Seneca({})
si.listen(transportConfig.clients[0])
si.add({role: 'role_1', cmd: '_healthCheck'}, function(args, done){
  done(null, {ok: true, result:{timestamp: new Date(), service:'role_1'}})
})

var ping = require('../libs/tool').getPing({}, transportConfig)
ping('role_1')
.then(res=>console.log('res', res))