/**
 * @fileoverview Test suite for formatter.js
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const chai = require('chai')
const moment = require('moment')

const expect = chai.expect

const formatter = require('../server/formatter')

describe('formatter.js', () => {
  describe('formatTextWrap()', () => {
    it('should work with regular input', () => {
      formatter.formatTextWrap('hi there is a dong', 10).should.equal(
        'hi there\nis a dong')
      formatter.formatTextWrap('hi there is a dong what the fuck', 10)
        .should.equal('hi there\nis a dong\nwhat the\nfuck')
    })

    it('should work with empty input', () => {
      formatter.formatTextWrap('', 10).should.equal('')
      formatter.formatTextWrap(null, 10).should.equal('null')
      formatter.formatTextWrap(' ', 10).should.equal('')
    })

    it('should work on inputs with multiple spaces and tabs', () => {
      formatter.formatTextWrap('  what     the \t heck?  \t', 8)
        .should.equal('what the\nheck?')
      formatter.formatTextWrap('\t\t what   \t the heck \t ', 20)
        .should.equal('what the heck')
      formatter.formatTextWrap('fuck i hate unit tests   sooo    \t much', 12)
        .should.equal('fuck i hate\nunit tests\nsooo much')
    })
  })

  describe('formatHelp()', () => {
    it('should run without breaking', () => {
      // eslint-disable-next-line no-unused-expressions
      formatter.formatHelp(true).should.be.ok
      // eslint-disable-next-line no-unused-expressions
      formatter.formatHelp(false).should.be.ok
    })
  })

  describe('formatDate()', () => {
    it('should properly format valid inputs', () => {
      const d1 = moment(100)
      const d2 = moment(19238739)

      formatter.formatDate(d1).should.equal(
        'Published on Dec 31st, 1969 at 7:00pm')
      formatter.formatDate(d2).should.equal(
        'Published on Jan 1st, 1970 at 12:20am')
    })

    it('should return the proper string on bad inputs', () => {
      formatter.formatDate(null).should.equal(
        'Publication date not available')
      formatter.formatDate(moment(null)).should.equal(
        'Publication date not available')
    })
  })

  describe('formatArticles()', () => {
    it('should run without breaking', () => {
      // eslint-disable-next-line no-unused-expressions
      formatter.formatArticles([
        {
          source: {
            name: 'source1'
          },
          title: 'title1',
          publishedAt: 100,
          description: 'description1',
          url: 'url1'
        }, {
          source: {
            name: 'source2'
          },
          title: 'title2',
          publishedAt: 200,
          description: 'description2',
          url: 'url2'
        }
      ], null).should.be.ok
    })
  })
})
