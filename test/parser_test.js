/**
 * @fileoverview Unit test suite for parser.js
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const chai = require('chai')

const expect = chai.expect

const parser = require('../server/parser')

describe('parser.js', () => {
  describe('parseSubdomain()', () => {
    const fn = parser.parseSubdomain
    
    it('should work with valid regular input', () => {
      expect(fn(['dev', 'eg'])).to.equal('eg')
      expect(fn(['us'])).to.equal('us')
    })

    it('should work with invalid regular input', () => {
      expect(fn(['dev', 'ad'])).to.be.null
      expect(fn(['ge'])).to.be.null
    })

    it('should work with empty input', () => {
      expect(fn([])).to.be.null
    })
  })

  describe('parseArgs()', () => {
    const fn = parser.parseArgs
    
    it('should work with valid regular input', () => {
      expect(fn('queryd')).to.equal({
        query: 'queryd'
      })
      expect(fn('multi+word+query')).to.shallow.equal({
        query: 'multi word query'
      })
      expect(fn('page=2')).to.shallow.equal({
        page: '2'
      })
      expect(fn('pageSize=15')).to.shallow.equal({
        pageSize: '15'
      })
      expect(fn('query+query2,page=2,pageSize=5')).to.shallow.equal({
        query: 'query query2',
        page: '2',
        pageSize: '5'
      })
    })
  })
})
