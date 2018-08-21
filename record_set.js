var exports = module.exports = {};

class RecordSet {
    constructor() {
        this.records = {}
    }

    addEntry(entryNumber, key, item) {
        this.records[key] = item
    }

    get csvHeader() {
        if(this.records == {}) {
            return "key";
        }
        const firstRecord = Object.entries(this.records)[0][1]
        const columns = Object.keys(firstRecord)
        columns.unshift("key")
        return columns.join(",")
    }

    get json() {
        return JSON.stringify(this.records, null, 2) + "\n"
    }

    populateFromJSON(jsonString) {
        this.records = JSON.parse(jsonString)
    }

    get csvValues() {
        const records = []
        for (const [key, record] of Object.entries(this.records)) {
            records.push(key + "," + record)
        }

        return records.join('\n')
    }
}

exports.RecordSet = RecordSet