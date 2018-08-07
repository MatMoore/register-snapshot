const fetcher = require('./fetcher');
const RegisterStatus = require('./manifest').RegisterStatus
const nock = require('nock');

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
    const register = new RegisterStatus(country, country_url, "all", 0)

    it('fetches JSON', async () => {
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
                       "index-entry-number":"1",
                       "entry-number":"1",
                       "entry-timestamp":"2016-10-21T16:11:20Z",
                       "key":"BAS",
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

        const response = await fetcher.fetchJSON(register)
        expect(response).toEqual(JSON.stringify([sovietUnion], null, 2))
    })


    it('fetches csv', async () => {
        const sovietUnion = "country,name,official-name,citizen-names,start-date,end-date\n" +
            [sovietUnionKey, sovietUnionName, sovietUnionOfficialName, sovietUnionCitizenNames, '', sovietUnionEndDate].join(',')

        nock(country_url)
            .get('/entries.json/?start=0')
            .reply(
                200,
                [  
                    {  
                       "index-entry-number":"1",
                       "entry-number":"1",
                       "entry-timestamp":"2016-10-21T16:11:20Z",
                       "key":"BAS",
                       "item-hash":[  
                          sovietUnionItemHash
                       ]
                    }
                ]
            )

        nock(country_url)
            .get('/items/' + sovietUnionItemHash + '.csv')
            .reply(
                200,
                sovietUnion
            )

        const response = await fetcher.fetchCSV(register)
        expect(response).toEqual(sovietUnion)
    })

    it('paginates to the latest entry', async () => {
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

        const response = await fetcher.fetchJSON(register)
        expect(response).toEqual(JSON.stringify([sovietUnion, westGermany], null, 2))
    })

    it('raises an error if the fetch failed', function() {
        
    })

    it('tells you the latest entry number', function() {

    })

    it('warns if integrity of the register has been broken', function() {

    })

    it('fetches an incremental update', function() {

    })

    it('filters by status', function() {

    })
})