/**
 * @fileoverview Test suite for formatter.js
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */
/* eslint-disable no-unused-expressions */

const chai = require('chai')
const moment = require('moment')

const expect = chai.expect

const formatter = require('../server/formatter')

describe('formatter.js', () => {
  describe('formatTextWrap()', () => {
    const fn = formatter.formatTextWrap

    it('should work with regular input', () => {
      expect(fn('hi there is a pet', 10)).to.equal('hi there\nis a pet')
      expect(fn('hi there is a pet what the fuck', 10)).to.equal(
        'hi there\nis a pet\nwhat the\nfuck')
    })

    it('should work with empty input', () => {
      expect(fn('', 10)).to.equal('')
      expect(fn(null, 10)).to.equal('null')
      expect(fn(' ', 10)).to.equal('')
    })

    it('should work on inputs with multiple spaces and tabs', () => {
      expect(fn('  what     the \t heck?  \t', 8)).to.equal('what the\nheck?')
      expect(fn('\t\t what   \t the heck \t ', 20)).to.equal('what the heck')
      expect(fn('fuck i hate unit tests   sooo    \t much', 12)).to.equal(
        'fuck i hate\nunit tests\nsooo much')
    })
  })

  describe('formatDate()', () => {
    const fn = formatter.formatDate

    it('should properly format valid inputs', () => {
      expect(fn(moment(100))).to.equal('Published on Dec 31st, 1969 at 7:00pm')
      expect(fn(moment(19238739))).to.equal(
        'Published on Jan 1st, 1970 at 12:20am')
    })

    it('should return the proper string on bad inputs', () => {
      expect(fn(null)).to.equal('Publication date not available')
      expect(fn(moment(null))).to.equal('Publication date not available')
    })
  })

  describe('formatArticles()', () => {
    const fn = formatter.formatArticles

    it('should run without breaking', () => {
      const articles = [
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
      ]
      expect(fn(articles, null)).to.exist
    })
  })
})
