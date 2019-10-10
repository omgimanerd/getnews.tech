/**
 * @fileoverview Unit test suite for parser.js
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */
/* eslint-disable no-unused-expressions, require-jsdoc */

const chai = require('chai')

const expect = chai.expect

const errors = require('../server/errors')
const parser = require('../server/parser')

const RecoverableError = errors.RecoverableError

describe('parser.js', () => {
  describe('parseSubdomain()', () => {
    const fn = parser.parseSubdomain
    const fnThrow = arg => () => parser.parseSubdomain(arg)

    it('should work with valid regular input', () => {
      expect(fn(['dev', 'eg'])).to.equal('eg')
      expect(fn(['us'])).to.equal('us')
      expect(fn(['dev'])).to.be.null
    })

    it('should throw with invalid regular input', () => {
      expect(fnThrow(['dev', 'ad'])).to.throw(
        RecoverableError, /ad is not a valid country to query\./)
      expect(fnThrow(['ge'])).to.throw(
        RecoverableError, /ge is not a valid country to query\./)
    })

    it('should work with empty input', () => {
      expect(fn([])).to.be.null
    })
  })

  describe('parseArgs()', () => {
    const fn = parser.parseArgs
    const fnThrow = arg => () => parser.parseArgs(arg)

    it('should work with valid regular input', () => {
      expect(fn('queryd')).to.deep.equal({
        query: 'queryd'
      })
      expect(fn('multi+word+query')).to.deep.equal({
        query: 'multi word query'
      })
      expect(fn('page=2')).to.deep.equal({
        page: 2
      })
      expect(fn('n=15')).to.deep.equal({
        n: 15
      })
      expect(fn('query+query2,page=2,n=5')).to.deep.equal({
        query: 'query query2',
        page: 2,
        n: 5
      })
      expect(fn('trump,category=business')).to.deep.equal({
        query: 'trump',
        category: 'business'
      })
      expect(fn('category=general')).to.deep.equal({
        category: 'general'
      })
    })

    it('should throw an error with unparseable input', () => {
      const reMatch = /Unable to parse ".*"\./
      expect(fnThrow(',,')).to.throw(RecoverableError, reMatch)
      expect(fnThrow('query,=,')).to.throw(RecoverableError, reMatch)
      expect(fnThrow('query,')).to.throw(RecoverableError, reMatch)
      expect(fnThrow(',page=2,')).to.throw(RecoverableError, reMatch)
    })

    it('should throw an error with invalid parseable input', () => {
      const reInvalidArg = /Invalid arguments ".*"\./
      const reInvalidCategory = /.* is not a valid category\./
      const reInvalidNaN = /.* is not a valid value for arg (page|n)\./
      expect(fnThrow('query,yonk=2j')).to.throw(RecoverableError, reInvalidArg)
      expect(fnThrow('query,bok=yodl')).to.throw(RecoverableError, reInvalidArg)
      expect(fnThrow('q,category=genrl')).to.throw(
        RecoverableError, reInvalidCategory)
      expect(fnThrow('q,n=e2')).to.throw(RecoverableError, reInvalidNaN)
      expect(fnThrow('q,page=2j')).to.throw(RecoverableError, reInvalidNaN)
    })
  })
})
