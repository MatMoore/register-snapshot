var exports = module.exports = {};
const fetch = require('node-fetch')
const parseLinkHeader = require('parse-link-header')

function raiseOnError(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

async function getEntries(registerUrl, pagination) {
    let entriesResponse
    const entries = []

    while (true) {
        try {
            entriesResponse = await fetch(registerUrl + '/entries.json/' + pagination).then(raiseOnError)
        } catch (e) {
            throw new Error("Unable to fetch entries: " + e.message)
        }

        for (const entry of await entriesResponse.json()) {
            entries.push(entry)
        }

        const links = parseLinkHeader(entriesResponse.headers.get("link"))
        if(links !== null && links.next !== null && links.next !== undefined) {
            pagination = links.next.url
        } else {
            return entries;
        }
    }
}

async function getItemJSON(registerUrl, itemHash) {
    let itemResponse
    try {
        //console.time(`fetch-${registerUrl}-${itemHash}`)
        itemResponse = await fetch(registerUrl + '/items/' + itemHash + '.json').then(raiseOnError)
        //console.timeEnd(`fetch-${registerUrl}-${itemHash}`)
    } catch(e) {
        throw new Error("Unable to fetch item " + itemHash + ": " + e.message)
    }

    return await itemResponse.json()
}

class Filterer {
    constructor(status) {
        this.now = Date.now()
        this.status = status
    }

    isArchived(item) {
        if(item['end-date'] === null) {
            return false
        }
        const endDate = Date.parse(item['end-date'])
        return endDate < this.now
    }

    isPending(item) {
        if(item['start-date'] === null) {
            return false
        }
        const startDate = Date.parse(item['start-date'])
        return startDate > this.now
    }

    isCurrent(item) {
        return !this.isArchived(item) && !this.isPending(item)
    }

    isIncluded(item) {
        if(this.status === 'archived') {
            return this.isArchived(item)
        }
        if(this.status === 'current') {
            return this.isCurrent(item)
        }
        if(this.status === 'pending') {
            return this.isPending(item)
        }

        return true
    }
}

async function fetchJSON(register) {
    const recordSet = register.recordSet
    const filterer = new Filterer(register.status)
    const entries = await getEntries(register.url, "?start=" + register.entry)

    for (const entry of entries) {
        const itemHash = entry['item-hash'][0]
        const key = entry.key

        // TODO: fetch items in parallel?
        const item = await getItemJSON(register.url, itemHash)
        const entryNumber = parseInt(entry['entry-number'], 10)

        if(filterer.isIncluded(item)) {
            recordSet.addEntry(entryNumber, key, item)
        }

        register.entry = entryNumber
    }
}

async function fetchTotalEntries(register) {
    const endpoint = register.url + '/register.json'
    const response = await fetch(endpoint).then(raiseOnError)
    const result = await response.json()
    return parseInt(result['total-entries'], 10)
}

exports.fetchJSON = fetchJSON
exports.fetchTotalEntries = fetchTotalEntries