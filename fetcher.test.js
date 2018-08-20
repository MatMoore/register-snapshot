const fetcher = require('./fetcher');
const Register = require('./manifest').Register
const nock = require('nock')
const RecordSet = require('./record_set').RecordSet

const country_url = "https://country.register.gov.uk"
const country = "country"
const sovietUnionEndDate = "1991-12-25"
const sovietUnionKey = "SU"
const sovietUnionOfficialName = "Union of Soviet Socialist Republics"
const sovietUnionName = "USSR"
const sovietUnionCitizenNames = "Soviet citizen"
const sovietUnionItemHash = "sha-256:6c4c815895ea675857ee4ec3fb40571ce54faf5ebcdd5d73a2aae347d4003c31"
const westGermanyItemHash = "sha-256:e03f97c2806206cdc2cc0f393d09b18a28c6f3e6218fc8c6f3aa2fdd7ef9d625"
const westGermanyKey = "DE"
const westGermanyOfficialName = "Federal Republic of Germany"
const westGermanyName = "West Germany"
const westGermanyCitizenNames = "West German"
const westGermanyEndDate = "1990-10-02"

describe('fetch', () => {
    const register = () => new Register(country, country_url, "all", 0)

    it('fetches JSON', async () => {
        const r = register()

        const sovietUnion = {
            "end-date": sovietUnionEndDate,
            "country": sovietUnionKey,
            "official-name": sovietUnionOfficialName,
            "name": sovietUnionName,
            "citizen-names": sovietUnionCitizenNames
        }

        nock(country_url)
            .get('/entries.json/?start=0')
            .reply(
                200,
                [
                    {
                       "index-entry-number": "1",
                       "entry-number": "1",
                       "entry-timestamp": "2016-10-21T16:11:20Z",
                       "key": sovietUnionKey,
                       "item-hash":[
                          sovietUnionItemHash
                       ]
                    }
                ]
            )

        nock(country_url)
            .get('/items/' + sovietUnionItemHash + '.json')
            .reply(
                200,
                sovietUnion
            )

        await fetcher.fetchJSON(r)
        expect(r.recordSet.json).toEqual(JSON.stringify({SU: sovietUnion}, null, 2))
    })

    it('paginates to the latest entry', async () => {
        const r = register()

        const sovietUnion = {
            "end-date": sovietUnionEndDate,
            "country": sovietUnionKey,
            "official-name": sovietUnionOfficialName,
            "name": sovietUnionName,
            "citizen-names": sovietUnionCitizenNames
        }

        const westGermany = {
            "end-date": westGermanyEndDate,
            "country": westGermanyKey,
            "official-name": westGermanyOfficialName,
            "name": westGermanyName,
            "citizen-names": westGermanyCitizenNames
        }

        nock(country_url)
            .get('/entries.json/?start=0')
            .reply(
                200,
                [
                    {
                       "index-entry-number":"1",
                       "entry-number":"1",
                       "entry-timestamp":"2016-10-21T16:11:20Z",
                       "key": sovietUnionKey,
                       "item-hash":[
                          sovietUnionItemHash
                       ]
                    }
                ],
                {'Link': '<?start=1&limit=100>; rel="next"'}
            )

        nock(country_url)
            .get('/entries.json/?start=1&limit=100')
            .reply(
                200,
                [
                    {
                       "index-entry-number":"2",
                       "entry-number":"2",
                       "entry-timestamp":"2016-10-21T16:11:20Z",
                       "key": westGermanyKey,
                       "item-hash":[
                          westGermanyItemHash
                       ]
                    }
                ]
            )

        nock(country_url)
            .get('/items/' + sovietUnionItemHash + '.json')
            .reply(
                200,
                sovietUnion
            )


        nock(country_url)
            .get('/items/' + westGermanyItemHash + '.json')
            .reply(
                200,
                westGermany
            )

        await fetcher.fetchJSON(r)
        expect(r.recordSet.json).toEqual(JSON.stringify({SU: sovietUnion, DE: westGermany}, null, 2))
    })

    it('raises an error if the fetch failed', async () => {
        const r = register()

        nock(country_url)
            .get('/entries.json/?start=0')
            .reply(500, {})

        expect.assertions(1);
        await expect(fetcher.fetchJSON(r)).rejects.toEqual(
            new Error("Unable to fetch entries: Internal Server Error")
        );
    })

    it('tells you the next entry number', async function() {
        const countryRegister = register()

        const sovietUnion = {
            "end-date": sovietUnionEndDate,
            "country": sovietUnionKey,
            "official-name": sovietUnionOfficialName,
            "name": sovietUnionName,
            "citizen-names": sovietUnionCitizenNames
        }

        nock(country_url)
            .get('/entries.json/?start=0')
            .reply(
                200,
                [
                    {
                       "index-entry-number": "1",
                       "entry-number": "1",
                       "entry-timestamp": "2016-10-21T16:11:20Z",
                       "key": sovietUnionKey,
                       "item-hash":[
                          sovietUnionItemHash
                       ]
                    }
                ]
            )

        nock(country_url)
            .get('/items/' + sovietUnionItemHash + '.json')
            .reply(
                200,
                sovietUnion
            )

        await fetcher.fetchJSON(countryRegister)
        expect(countryRegister.entry).toBe(1)

    })

    describe('filtering by status', () => {
        const sovietUnion = {
            "end-date": sovietUnionEndDate,
            "country": sovietUnionKey,
            "official-name": sovietUnionOfficialName,
            "name": sovietUnionName,
            "citizen-names": sovietUnionCitizenNames
        }

        const republicOfMat = {
            "start-date": "3000-01-01",
            "country": "MM",
            "official-name": "Republic of Mat",
            "name": "Matland",
            "citizen-names": "Mat"
        }

        const uk = {
            "country": "GB",
            "official-name": "The United Kingdom of Great Britain and Northern Ireland",
            "name": "United Kingdom",
            "citizen-names": "Briton;British citizen"
        }

        beforeEach(() => {
            nock(country_url)
                .get('/entries.json/?start=0')
                .reply(
                    200,
                    [
                        {
                           "index-entry-number": "0",
                           "entry-number": "0",
                           "entry-timestamp": "2016-10-21T16:11:20Z",
                           "key": sovietUnionKey,
                           "item-hash":[
                              sovietUnionItemHash
                           ]
                        },
                        {
                            "index-entry-number": "1",
                            "entry-number": "1",
                            "entry-timestamp": "2016-10-21T16:11:20Z",
                            "key": "GB",
                            "item-hash":[
                               "gbHash"
                            ]
                        },
                        {
                            "index-entry-number": "2",
                            "entry-number": "2",
                            "entry-timestamp": "2016-10-21T16:11:20Z",
                            "key": "MM",
                            "item-hash":[
                               "mmHash"
                            ]
                        }
                    ]
                )

            nock(country_url)
                .get('/items/' + sovietUnionItemHash + '.json')
                .reply(
                    200,
                    sovietUnion
                )

            nock(country_url)
                .get('/items/gbHash.json')
                .reply(
                    200,
                    uk
                )


            nock(country_url)
                .get('/items/mmHash.json')
                .reply(
                    200,
                    republicOfMat
                )
        })

        it('applies the archived filter', async function() {
            const countryRegister = new Register(country, country_url, "archived", 0)
            await fetcher.fetchJSON(countryRegister)
            expect(countryRegister.recordSet.records).toEqual({SU: sovietUnion})
        })

        it('applies the current filter', async function() {
            const countryRegister = new Register(country, country_url, "current", 0)
            await fetcher.fetchJSON(countryRegister)
            expect(countryRegister.recordSet.records).toEqual({GB: uk})
        })

        it('applies the pending filter', async function() {
            const countryRegister = new Register(country, country_url, "pending", 0)
            await fetcher.fetchJSON(countryRegister)
            expect(countryRegister.recordSet.records).toEqual({MM: republicOfMat})
        })

        it('updates the entry number even if the item is filtered out', async function() {
            const countryRegister = new Register(country, country_url, "archived", 0)
            await fetcher.fetchJSON(countryRegister)
            expect(countryRegister.entry).toBe(2)
        })
    })
})