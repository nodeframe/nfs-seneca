export function register(seneca, transportConfig = {}) {
	if(transportConfig.uses){
    transportConfig.uses.reduce((prev,curr)=>{
      return prev.use(curr);
    }, seneca);
  }

  if(transportConfig.listenings){
    transportConfig.listenings.reduce((prev,curr)=>{
      return prev.listen(curr);
    }, seneca);
  }

  if(transportConfig.clients){
    transportConfig.clients.reduce((prev,curr)=>{
      return prev.client(curr);
    }, seneca);
  }
}