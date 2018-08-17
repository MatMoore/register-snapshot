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
        if(links !== null && links.next !== null) {
            pagination = links.next.url
        } else {
            return entries; 
        }
    }
}

async function getItemJSON(registerUrl, itemHash) {
    let itemResponse
    try {
        itemResponse = await fetch(registerUrl + '/items/' + itemHash + '.json').then(raiseOnError)
    } catch(e) {
        throw new Error("Unable to fetch item " + itemHash + ": " + e.message)
    }

    return await itemResponse.json()
}

async function fetchJSON(recordSet) {
    const registerStatus = recordSet.registerStatus
    const entries = await getEntries(registerStatus.url, "?start=" + registerStatus.entry)

    for (const entry of entries) {
        const itemHash = entry['item-hash'][0]
        const key = entry.key
        const item = await getItemJSON(registerStatus.url, itemHash)
        recordSet.addEntry(parseInt(entry['entry-number'], 10), key, item)
    }
}

exports.fetchJSON = fetchJSON