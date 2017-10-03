import { expect, use as chaiUse } from 'chai'

chaiUse(require('chai-datetime'))

import { CommitIdentity } from '../../src/models/commit-identity'

describe('CommitIdentity', () => {
  describe('#parseIdent', () => {
    it('understands a normal ident string', () => {
      const identity = CommitIdentity.parseIdentity('Markus Olsson <markus@github.com> 1475670580 +0200')
      expect(identity).not.to.be.null

      expect(identity!.name).to.equal('Markus Olsson')
      expect(identity!.email).to.equal('markus@github.com')
      expect(identity!.date).to.equalTime(new Date('2016-10-05T12:29:40.000Z'))
    })

    it('parses timezone information', () => {
      const identity1 = CommitIdentity.parseIdentity('Markus Olsson <markus@github.com> 1475670580 +0130')
      expect(identity1!.tzOffset).to.equal(90)

      const identity2 = CommitIdentity.parseIdentity('Markus Olsson <markus@github.com> 1475670580 -0245')
      expect(identity2!.tzOffset).to.equal(-165)
    })

    it('parses even if the email address isn\'t a normal email', () => {
      const identity = CommitIdentity.parseIdentity('Markus Olsson <Markus Olsson> 1475670580 +0200')
      expect(identity).not.to.be.null

      expect(identity!.name).to.equal('Markus Olsson')
      expect(identity!.email).to.equal('Markus Olsson')
    })

    it('parses even if the email address is broken', () => {
      // https://github.com/git/git/blob/3ef7618e616e023cf04180e30d77c9fa5310f964/ident.c#L292-L296
      const identity = CommitIdentity.parseIdentity('Markus Olsson <Markus >Olsson> 1475670580 +0200')
      expect(identity).not.to.be.null

      expect(identity!.name).to.equal('Markus Olsson')
      expect(identity!.email).to.equal('Markus >Olsson')
    })
  })
})
