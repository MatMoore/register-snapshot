var exports = module.exports = {}
const fs = require('fs')
const RecordSet = require('./record_set').RecordSet
const path = require('path')

const findDataDir = () => {
  let directory = path.normalize('.')
  const root = path.parse(directory).root || '/'

  while(directory !== root) {
    directory = path.resolve(directory, '..')
    dataPath = path.resolve(directory, 'data')
    manifestPath = path.resolve(dataPath, 'registers.json')

    if(fs.existsSync(manifestPath)) {
      return dataPath
    }
  }

  return path.resolve('data')
}

class Manifest {
  constructor() {
    this.registers = {}
  }

  static load() {
    const dataDir = findDataDir()
    const manifestPath = path.resolve(dataDir, 'registers.json')
    if (fs.existsSync(manifestPath)) {
        try {
            const contents = fs.readFileSync(manifestPath)
            const serialized = JSON.parse(contents)
            return Manifest.deserialize(serialized)
        } catch (err) {
            throw new Error(`Unable to load ${manifestPath}: ${err.stack}`)
        }
    } else {
        return new Manifest()
    }
  }

  save() {
    const dataDir = findDataDir()
    const manifestPath = path.resolve(dataDir, 'registers.json')

    try {
        const serialized = this.serialize()
        const contents = JSON.stringify(serialized, null, 2)

        if (!fs.existsSync(dataDir)){
            fs.mkdirSync(dataDir);
        }

        fs.writeFileSync(manifestPath, contents)
    } catch (err) {
        throw new Error('Unable to save file: ' + manifestPath + '. ' + err.stack)
    }
  }

  addRegister(name, url, status, entry) {
    let register = new Register(name, url, status, entry)
    this.registers[name] = register
    return register
  }

  removeRegister(name) {
    delete this.registers[name]
  }

  register(name) {
    const result = this.registers[name]
    if(result === undefined) {
      return null
    }
    return result
  }

  setRegister(name, url, status) {
    let value = this.register(name)
    if(value === null) {
      value = this.addRegister(name, url, status, 0)
    }
    if(value.status !== status) {
      throw new Error(`You are trying to download ${status} records but you already have a copy with ${value.status} records. Try removing it first: register-snapshot remove ${name}`)
    }
    return value
  }

  static deserialize(json) {
    const instance = new Manifest()
    for (const [key, value] of Object.entries(json.registers)) {
      let register = new Register()
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

class Register {
  constructor(name, url, status, entry) {
    this.name = name
    this.url = url
    this.status = status
    this.recordSet = new RecordSet()

    // This is the entry number of the next entry to fetch
    if(entry === undefined) {
      entry = 0
    }
    this.entry = entry
  }

  get id(){
    return Register.id(this.name, this.status)
  }

  static id(name, status) {
    return name + "/" + status
  }

  get filename() {
    return this.name + '_' + this.status + '.json'
  }

  load() {
    if(this.entry === 0) {
        return
    }

    const dataDir = findDataDir()
    const registerPath = path.resolve(dataDir, 'registers', this.filename)

    if (!fs.existsSync(registerPath)) {
        throw new Error(`Unable to load register file '${registerPath}, but there should be ${this.entry} records.'`)
    }

    try {
        const contents = fs.readFileSync(registerPath)
        this.recordSet.populateFromJSON(contents)
    } catch (err) {
        throw new Error(`ERROR: unable to open file '${registerPath}': ` + err.stack)
    }

    return
  }

  delete() {
    const dataDir = findDataDir()
    const registerPath = path.resolve(dataDir, 'registers', this.filename)
    if (fs.existsSync(registerPath)) {
      fs.unlinkSync(registerPath)
    }
  }

  save() {
    const contents = this.recordSet.json
    const dataDir = findDataDir()
    const registersDir = path.resolve(dataDir, 'registers')
    const filePath = path.resolve(registersDir, this.filename)

    try {
        if (!fs.existsSync(dataDir)){
          fs.mkdirSync(dataDir)
        }
        if (!fs.existsSync(registersDir)){
            fs.mkdirSync(registersDir)
        }

        fs.writeFileSync(filePath, contents)
    } catch (err) {
        throw new Error(`ERROR: unable to save file '${filePath}': ` + err.stack)
    }
  }

}

exports.Manifest = Manifest
exports.Register = Register