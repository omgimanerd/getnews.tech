/**
 * @fileoverview Test suite for api.js
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const nock = require('nock')

chai.use(chaiAsPromised)
chai.should()

const NEWS_API_KEY = 'key1'
const URL_SHORTENER_API_KEY = 'key2'

process.env.NEWS_API_KEY = NEWS_API_KEY
process.env.URL_SHORTENER_API_KEY = URL_SHORTENER_API_KEY

const api = require('../server/api')

describe('api.js', function() {
  this.timeout(10000)

  describe('shortenUrl()', () => {
    before(() => {
      nock('https://www.googleapis.com')
        .post('/urlshortener/v1/url', { longUrl: 'test1' })
        .query({ key: URL_SHORTENER_API_KEY })
        .reply(200, { id: 'test_result_id' })
        .post('/urlshortener/v1/url', { longUrl: 'test2' })
        .query({ key: URL_SHORTENER_API_KEY })
        .reply(400)
        .post('/urlshortener/v1/url', { longUrl: 'test3' })
        .query({ key: URL_SHORTENER_API_KEY })
        .thrice()
        .reply(400)
        .post('/urlshortener/v1/url', { longUrl: 'test3' })
        .query({ key: URL_SHORTENER_API_KEY })
        .reply(200, { id: 'test_result_id' })
    })

    it('should work correctly when a valid result is returned', () => {
      return api.shortenUrl('test1').should.become('test_result_id')
    })

    it('should return a ServerError if all requests fail', () => {
      return api.shortenUrl('test2').should.be.rejected
    })

    it('should retry correctly even after few failures', () => {
      return api.shortenUrl('test3').should.become('test_result_id')
    })

    after(nock.cleanAll)
  })

  describe('fetchSources()', () => {
    before(() => {
      nock('https://newsapi.org')
        .get('/v1/sources')
        .query({ test: 'test1' })
        .reply(200, { sources: 'test_result_source' })
        .get('/v1/sources')
        .query({ test: 'test2' })
        .reply(400)
    })

    it('should work correctly when a valid result is returned', () => {
      return api.fetchSources({
        test: 'test1'
      }).should.become('test_result_source')
    })

    it('should return a ServerError if the request failed', () => {
      return api.fetchSources({
        test: 'test2'
      }).should.be.rejected
    })

    after(nock.cleanAll)
  })

  describe('fetchArticles()', () => {
    before(() => {
      nock('https://www.googleapis.com')
        .post('/urlshortener/v1/url', { longUrl: 'test1' })
        .query({ key: URL_SHORTENER_API_KEY })
        .times(10)
        .reply(200, { id: 'test_result_id' })

      nock('https://newsapi.org')
        .get('/v1/articles')
        .query({ source: 'test1', apiKey: NEWS_API_KEY })
        .reply(200, {
          articles: [{
            url: 'test1', publishedAt: 100
          }, {
            url: 'test1', publishedAt: 200
          }]
        })
        .get('/v1/articles')
        .query({ source: 'test2', apiKey: NEWS_API_KEY })
        .reply(400, {
          error: 'test_error'
        })
    })

    it('should work correctly when a valid result is returned', () => {
      return api.fetchArticles('test1').should.eventually.satisfy(values => {
        return values.every(value => {
          return value.url === 'test_result_id' && value.publishedAt.isValid()
        }) && values.length === 2
      })
    })

    it('should return a ServerError if the request failed', () => {
      return api.fetchArticles('test2').should.be.rejected
    })

    after(nock.cleanAll)
  })
})
