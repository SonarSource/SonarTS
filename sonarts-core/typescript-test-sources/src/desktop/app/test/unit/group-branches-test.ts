import * as chai from 'chai'
const expect = chai.expect

import { groupBranches } from '../../src/ui/branches/group-branches'
import { Branch, BranchType } from '../../src/models/branch'
import { Commit } from '../../src/models/commit'
import { CommitIdentity } from '../../src/models/commit-identity'

describe('Branches grouping', () => {

  const author = new CommitIdentity('Hubot', 'hubot@github.com', new Date())
  const commit = new Commit('300acef', 'summary', 'body', author, [])

  const currentBranch = new Branch('master', null, commit, BranchType.Local)
  const defaultBranch = new Branch('master', null, commit, BranchType.Local)
  const recentBranches = [
    new Branch('some-recent-branch', null, commit, BranchType.Local),
  ]
  const otherBranch = new Branch('other-branch', null, commit, BranchType.Local)

  const allBranches = [
    currentBranch,
    ...recentBranches,
    otherBranch,
  ]

  it('should group branches', () => {
    const groups = groupBranches(defaultBranch, currentBranch, allBranches, recentBranches)
    expect(groups.length).to.equal(3)

    expect(groups[0].identifier).to.equal('default')
    let items = groups[0].items
    expect(items[0].branch).to.equal(defaultBranch)

    expect(groups[1].identifier).to.equal('recent')
    items = groups[1].items
    expect(items[0].branch).to.equal(recentBranches[0])

    expect(groups[2].identifier).to.equal('other')
    items = groups[2].items
    expect(items[0].branch).to.equal(otherBranch)
  })
})
