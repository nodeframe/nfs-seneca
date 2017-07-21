export function register(seneca, transportConfig = {}) {
  if (transportConfig.uses) {
    transportConfig.uses.reduce((prev, curr)=> {
      return prev.use(curr);
    }, seneca);
  }

  if (transportConfig.listenings) {
    if (Array.isArray(transportConfig.listenings)) {
      transportConfig.listenings.reduce((prev, curr)=> {
        return prev.listen(curr);
      }, seneca);
    } else {
      seneca.listen(transportConfig.listenings)
    }
  }

  if (transportConfig.clients) {
    if (Array.isArray(transportConfig.clients)) {
      transportConfig.clients.reduce((prev, curr)=> {
        return prev.client(curr);
      }, seneca);
    } else {
      seneca.client(transportConfig.clients)
    }
  }
}