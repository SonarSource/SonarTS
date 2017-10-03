/* tslint:disable:no-sync-functions */

import { expect } from 'chai'
import { GitError } from 'dugite'

import { Repository } from '../../../src/models/repository'
import { git } from '../../../src/lib/git'
import { setupFixtureRepository } from '../../fixture-helper'

const temp = require('temp').track()

describe('git/core', () => {
  let repository: Repository | null = null

  beforeEach(() => {
    const testRepoPath = setupFixtureRepository('test-repo')
    repository = new Repository(testRepoPath, -1, null, false)
  })

  after(() => {
    temp.cleanupSync()
  })

  describe('error handling', () => {
    it('does not throw for errors that were expected', async () => {
      const args = [ 'rev-list', '--left-right', '--count', 'some-ref', '--' ]

      let threw = false
      try {
        const result = await git(args, repository!.path, 'test', {
          expectedErrors: new Set([ GitError.BadRevision ]),
        })
        expect(result.gitError).to.equal(GitError.BadRevision)
      } catch (e) {
        threw = true
      }

      expect(threw).to.equal(false)
    })

    it('throws for errors that were not expected', async () => {
      const args = [ 'rev-list', '--left-right', '--count', 'some-ref', '--' ]

      let threw = false
      try {
        await git(args, repository!.path, 'test', {
          expectedErrors: new Set([ GitError.SSHKeyAuditUnverified ]),
        })
      } catch (e) {
        threw = true
      }

      expect(threw).to.equal(true)
    })
  })

  describe('exit code handling', () => {
    it('does not throw for exit codes that were expected', async () => {
      const args = [ 'rev-list', '--left-right', '--count', 'some-ref', '--' ]

      let threw = false
      try {
        const result = await git(args, repository!.path, 'test', {
          successExitCodes: new Set([ 128 ]),
        })
        expect(result.exitCode).to.equal(128)
      } catch (e) {
        threw = true
      }

      expect(threw).to.equal(false)
    })

    it('throws for exit codes that were not expected', async () => {
      const args = [ 'rev-list', '--left-right', '--count', 'some-ref', '--' ]

      let threw = false
      try {
        await git(args, repository!.path, 'test', {
          successExitCodes: new Set([ 2 ]),
        })
      } catch (e) {
        threw = true
      }

      expect(threw).to.equal(true)
    })
  })
})
