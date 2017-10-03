/* tslint:disable:no-sync-functions */

import { expect } from 'chai'

import { Repository } from '../../../src/models/repository'
import { getChangedFiles, getCommits } from '../../../src/lib/git'
import { setupFixtureRepository } from '../../fixture-helper'
import { FileStatus } from '../../../src/models/status'
import { GitProcess } from 'dugite'

const temp = require('temp').track()

describe('git/log', () => {

  let repository: Repository | null = null

  beforeEach(() => {
    const testRepoPath = setupFixtureRepository('test-repo')
    repository = new Repository(testRepoPath, -1, null, false)
  })

  after(() => {
    temp.cleanupSync()
  })

  describe('getCommits', () => {
    it('loads history', async () => {
      const commits = await getCommits(repository!, 'HEAD', 100)
      expect(commits.length).to.equal(5)

      const firstCommit = commits[commits.length - 1]
      expect(firstCommit.summary).to.equal('first')
      expect(firstCommit.sha).to.equal('7cd6640e5b6ca8dbfd0b33d0281ebe702127079c')
    })
  })

  describe('getChangedFiles', () => {
    it('loads the files changed in the commit', async () => {
      const files = await getChangedFiles(repository!, '7cd6640e5b6ca8dbfd0b33d0281ebe702127079c')
      expect(files.length).to.equal(1)
      expect(files[0].path).to.equal('README.md')
      expect(files[0].status).to.equal(FileStatus.New)
    })

    it('detects renames', async () => {
      const testRepoPath = setupFixtureRepository('rename-history-detection')
      repository = new Repository(testRepoPath, -1, null, false)

      const first = await getChangedFiles(repository, '55bdecb')
      expect(first.length).to.equal(1)
      expect(first[0].status).to.equal(FileStatus.Renamed)
      expect(first[0].oldPath).to.equal('NEW.md')
      expect(first[0].path).to.equal('NEWER.md')

      const second = await getChangedFiles(repository, 'c898ca8')
      expect(second.length).to.equal(1)
      expect(second[0].status).to.equal(FileStatus.Renamed)
      expect(second[0].oldPath).to.equal('OLD.md')
      expect(second[0].path).to.equal('NEW.md')
    })

    it('detect copies', async () => {
      const testRepoPath = setupFixtureRepository('copies-history-detection')
      repository = new Repository(testRepoPath, -1, null, false)

      // ensure the test repository is configured to detect copies
      await GitProcess.exec([ 'config', 'diff.renames', 'copies' ], repository.path)

      const files = await getChangedFiles(repository, 'a500bf415')
      expect(files.length).to.equal(2)

      expect(files[0].status).to.equal(FileStatus.Copied)
      expect(files[0].oldPath).to.equal('initial.md')
      expect(files[0].path).to.equal('duplicate-with-edits.md')

      expect(files[1].status).to.equal(FileStatus.Copied)
      expect(files[1].oldPath).to.equal('initial.md')
      expect(files[1].path).to.equal('duplicate.md')
    })
  })
})
