var exports = module.exports = {};

class Manifest {
  constructor() {
    this.registers = {}
  }

  addRegister(name, url, status, entry) {
    let register = new RegisterStatus(name, url, status, entry)
    this.registers[register.id] = register
  }

  removeRegister(name, status) {
    delete this.registers[RegisterStatus.id(name, status)]
  }

  static deserialize(json) {
    const instance = new Manifest()
    for (const [key, value] of Object.entries(json.registers)) {
      let register = new RegisterStatus()
      instance.addRegister(key, value.url, value.status, value.entry)
    }
    return instance
  }

  serialize() {
    const result = {}
    for (const register of Object.values(this.registers)) {
      result[register.name] = {
        url: register.url,
        status: register.status,
        entry: register.entry
      }
    }
    return {registers: result, version: "0.0.1"}
  }
}

class RegisterStatus {
  constructor(name, url, status, entry) {
    this.name = name
    this.url = url
    this.status = status
    this.entry = entry
  }

  get id(){
    return RegisterStatus.id(this.name, this.status)
  }

  static id(name, status) {
    return name + "/" + status
  }
}

exports.Manifest = Manifest
exports.RegisterStatus = RegisterStatus