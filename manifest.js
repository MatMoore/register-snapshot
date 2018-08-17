var exports = module.exports = {}
const fs = require('fs')
const RecordSet = require('./record_set').RecordSet

// TODO: support windows style paths
// and intelligently work out the root of the project
const manifestPath = 'data/registers.json'
const manifestDir = 'data'

class Manifest {
  constructor() {
    this.registers = {}
  }

  static load() {
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
    try {
        const serialized = this.serialize()
        const contents = JSON.stringify(serialized, null, 2)

        if (!fs.existsSync(manifestDir)){
            fs.mkdirSync(manifestDir);
        }

        fs.writeFileSync(manifestPath, contents)
    } catch (err) {
        throw new Error('Unable to save file: ' + manifestPath + '. ' + err.stack)
    }
  }

  addRegister(name, url, status, entry) {
    let register = new Register(name, url, status, entry)
    this.registers[register.id] = register
    return register
  }

  removeRegister(name, status) {
    delete this.registers[Register.id(name, status)]
  }

  register(name, status) {
    return this.registers[Register.id(name, status)]
  }

  setRegister(name, url, status) {
    let value = this.register(name, status)
    if(value === null) {
      value = this.addRegister(name, url, status, 0)
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

// TODO: make this data/registers
const dataDir = 'data'

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

  get filepath() {
      // TODO: support windows style paths
      return dataDir + '/' + this.filename
  }

  load() {
    if(this.entry === 0) {
        return
    }

    if (!fs.existsSync(this.filepath)) {
        throw new Error(`Unable to load register file '${registerPath}, but there should be ${Register.entry} records.'`)
    }

    try {
        const contents = fs.readFileSync(this.filepath)
        this.recordSet.populateFromJSON(contents)
    } catch (err) {
        throw new Error(`ERROR: unable to open file '${registerPath}': ` + err.stack)
    }

    return
  }

  save() {
    const contents = this.recordSet.json

    try {
        if (!fs.existsSync(dataDir)){
            fs.mkdirSync(dataDir)
        }

        fs.writeFileSync(this.filepath, contents)
    } catch (err) {
        throw new Error(`ERROR: unable to save file '${this.filepath}': ` + err.stack)
    }
  }

}

exports.Manifest = Manifest
exports.Register = Register