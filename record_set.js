var exports = module.exports = {};

class RecordSet {
    constructor(registerStatus) {
        this.records = {}
        this.registerStatus = registerStatus
    }

    addEntry(entryNumber, key, item) {
        if(entryNumber < this.registerStatus.entry) {
            throw new Exception('Entries must be processed in order')
        }
        this.registerStatus.entry = entryNumber + 1
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
        return JSON.stringify(this.records, null, 2)
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