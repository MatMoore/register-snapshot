let manifest = require('./manifest');

const country_url = "https://country.register.gov.uk"
const country = "country"

describe(manifest.Register, () => {
  it('is identified internally by its name and status', () => {
    const register = new manifest.Register(country, country_url, "current", 0)
    expect(register.id).toBe("country/current")
    expect(manifest.Register.id("country", "all")).toBe("country/all")
  })
})

describe(manifest.Manifest, () => {

  describe("addRegister", () => {
    it('adds an entry to the serialized output', () => {
      const m = new manifest.Manifest()

      m.addRegister(country, country_url, "current", 123)

      const serialized = m.serialize()
      const expected = {
        version: "0.0.1",
        registers: {
          country: {url: country_url, status: "current", entry: 123}
        }
      }

      expect(serialized).toEqual(expected);
    })
  })


  describe("removeRegister", () => {
    it('undoes an addRegister call', () => {
      const m = new manifest.Manifest()

      m.addRegister(country, country_url, "current", 123)
      m.removeRegister(country, "current")

      expect(m.serialize()).toEqual({registers: {}, version: "0.0.1"})
    })
  })

  describe("the serialized format", () => {
    it('can be deserialized again', () => {
      const m = new manifest.Manifest()

      m.addRegister(country, country_url, "current", 123)
      const serialized = m.serialize()
      const loaded = manifest.Manifest.deserialize(serialized)

      expect(Object.values(loaded.registers)).toEqual(
        [new manifest.Register(country, country_url, "current", 123)]
      )
    })
  })
})