export class SenecaMockup {
  constructor(r = []) {
    this.register = r
    this.added = []
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
  add(arg, func) {
    this.added.push({...arg, func: func})
    return this
  }
}