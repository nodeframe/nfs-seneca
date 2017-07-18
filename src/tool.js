import seneca from './index';
export function getPing(senecaConfig, transportConfig = {}) {
  const {act} = seneca(senecaConfig, transportConfig)
  return function(role){
    return act({role, cmd: '_healthCheck'})
  }
}