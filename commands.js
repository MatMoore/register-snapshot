var exports = module.exports = {};
const loader = require('./manifest_loader')

exports.fetchAll = function() {
    const manifest = loader.load()
    if(manifest === null) {
        return 1
    }

    for (const register of Object.values(manifest.registers)) {
        console.log('Fetching ' + register.name + ' (' + register.status + ')')
    }

    loader.save(manifest)
    console.log('Use "register-sync fetch <register>" to start tracking a new register.')

    if(Object.keys(manifest.registers).length == 0) {
        return 1
    } else {
        return 0
    }
}

exports.fetchRegister = function(register) {

}

exports.rm = function(register) {

}

exports.status = function() {

}