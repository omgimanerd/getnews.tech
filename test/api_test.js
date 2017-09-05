/**
 * @fileoverview Test suite for api.js
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const nock = require('nock')

chai.use(chaiAsPromised)
chai.should()

process.env.NEWS_API_KEY = 'news_api_key'
process.env.URL_SHORTENER_API_KEY = 'key'

const api = require('../server/api')

describe('shortenUrl()', () => {
  before(() => {
    nock(api.URL_SHORTENER_BASE_URL).post().reply(200, {
      id: 'test'
    })
  })

  it('should work', () => {
    return api.shortenUrl('asdf').should.eventually.equal('no')
  })

  after(() => nock.restore())
})
