var exports = module.exports = {};
const Manifest = require('./manifest').Manifest
const fetcher = require('./fetcher')

// TODO test this

exports.fetchAll = async () => {
    const manifest = Manifest.load()

    for (const register of Object.values(manifest.registers)) {
        register.load()

        const originalEntry = register.entry

        await fetcher.fetchJSON(register)

        if(register.entry !== originalEntry) {
            console.log(`Updated ${register.name} from ${originalEntry} -> ${register.entry}.`)
        } else {
            console.log(`${register.name} is up to date.`)
        }

        register.save()
    }

    manifest.save()

    console.log('Use "register-sync fetch <register URL>" to start tracking a new register.')

    if(Object.keys(manifest.registers).length == 0) {
        return 1
    } else {
        return 0
    }
}

exports.fetchRegister = async (url, status) => {
    if(!RegExp('^all|archived|current|pending$').test(status)) {
        throw new Error(`Invalid status '${status}'`)
    }

    if(!RegExp('^https://').test(url)) {
        throw new Error(`Invalid HTTPS URL '${url}'`)
    }

    const manifest = Manifest.load()
    const name = new URL(url).hostname.split('.')[0]
    const register = manifest.setRegister(name, url, status)

    register.load()

    console.log('Fetching ' + name + ' (' + status + ')')
    await fetcher.fetchJSON(register)

    register.save()

    console.log(`Saved to data/${name}_${status}.json`)
    console.log(`Use "register-snapshot remove ${name}" if you want to stop tracking this register and delete its data.`)

    manifest.save()
}

exports.rm = async (registerName) => {
    const manifest = Manifest.load()
    const register = manifest.register(registerName)
    if(register === null) {
        throw new Error(`Register ${registerName} not found. Doing nothing.`)
    }
    register.delete()

    console.log(`Deleting ${registerName}`)
    manifest.removeRegister(registerName, 'all')
    manifest.save()
}

exports.status = async () => {
    const manifest = Manifest.load()

    let ok = true

    for (const register of Object.values(manifest.registers)) {
        const totalEntriesLocal = register.entry
        const totalEntriesRemote = await fetcher.fetchTotalEntries(register)

        if(totalEntriesLocal < totalEntriesRemote) {
            console.log(`${register.name} is out of date. You have ${totalEntriesLocal} entries, but there are ${totalEntriesRemote - totalEntriesLocal} new entries.`)
            ok = false
        } else if (totalEntriesLocal > totalEntriesRemote) {
            console.log(`Local copy of ${register.name} has entries that no longer exist. You have ${totalEntriesLocal} entries, but the register has ${totalEntriesRemote} entries.`)
            ok = false
        } else {
            console.log(`${register.name} is up to date.`)
        }
    }

    if(ok) {
        return 0
    } else {
        return 1
    }
}