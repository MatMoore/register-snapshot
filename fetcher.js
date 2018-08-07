var exports = module.exports = {};
const fetch = require('node-fetch')
const parseLinkHeader = require('parse-link-header')

// TODO: store entry metadata as well as item data. We need to store at least the key
// TODO: update existing files

async function getEntries(registerUrl, pagination) {
    let entriesResponse
    const entries = []

    while (true) {
        try {  
            entriesResponse = await fetch(registerUrl + '/entries.json/' + pagination)
        } catch (e) {
            throw new Error("Unable to fetch entries: " + e.message)
        }

        for (const entry of await entriesResponse.json()) {
            entries.push(entry)
        }

        const links = parseLinkHeader(entriesResponse.headers.get("link"))
        if(links !== null && links.next !== null) {
            pagination = links.next.url
        } else {
            return entries; 
        }
    }
}

async function getItemCSV(registerUrl, itemHash) {
    let itemResponse
    try {
        itemResponse = await fetch(registerUrl + '/items/' + itemHash + '.csv')
    } catch(e) {
        throw new Error("Unable to fetch item " + itemHash + ": " + e.message)
    }

    const text = await itemResponse.text()
    const rows = text.split('\n')
    return rows
}

async function getItemJSON(registerUrl, itemHash) {
    let itemResponse
    try {
        itemResponse = await fetch(registerUrl + '/items/' + itemHash + '.json')
    } catch(e) {
        throw new Error("Unable to fetch item " + itemHash + ": " + e.message)
    }

    return await itemResponse.json()
}

async function fetchCSV(registerStatus) {
    const entries = await getEntries(registerStatus.url, "?start=" + registerStatus.entry)
    const responseRows = {}
    let header = null
    
    for (const entry of entries) {
        let values = null
        const itemHash = entry['item-hash'][0]
        const key = entry.key
        
        rows = await getItemCSV(registerStatus.url, itemHash)
        ;[header, values] = rows
        responseRows[key] = values
    }

    const records = [header]
    for (const row of Object.values(responseRows)) {
        records.push(row)
    }

    return records.join('\n')
}

async function fetchJSON(registerStatus) {
    const entries = await getEntries(registerStatus.url, "?start=" + registerStatus.entry)
    const records = {}
    
    for (const entry of entries) {
        const itemHash = entry['item-hash'][0]
        const key = entry.key
        const item = await getItemJSON(registerStatus.url, itemHash)
        records[key] = item
    }

    return JSON.stringify(Object.values(records), null, 2)
}

exports.fetchCSV = fetchCSV
exports.fetchJSON = fetchJSON