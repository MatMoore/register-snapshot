var exports = module.exports = {};
const Manifest = require('./manifest').Manifest
const fs = require('fs');

const manifestPath = 'data/registers.json'
const manifestDir = 'data'

function load() {
    if (fs.existsSync(manifestPath)) {
        try {
            const contents = fs.readFileSync(manifestPath)
            const serialized = JSON.parse(contents)
            return Manifest.deserialize(serialized)
        } catch (err) {
            console.log("ERROR: unable to open file: " + manifestPath + '. ' + err.stack)
            return null;
        }
    } else {
        return new Manifest()
    }
}

function save(manifest) {
    try {
        const serialized = manifest.serialize()
        const contents = JSON.stringify(serialized, null, 2)

        if (!fs.existsSync(manifestDir)){
            fs.mkdirSync(manifestDir);
        }

        fs.writeFileSync(manifestPath, contents)
    } catch (err) {
        console.log('Unable to save file: ' + manifestPath + '. ' + err.stack)
    }
}

exports.load = load
exports.save = save