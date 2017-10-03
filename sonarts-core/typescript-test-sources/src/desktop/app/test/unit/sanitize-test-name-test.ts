import * as chai from 'chai'
const expect = chai.expect

import { sanitizedBranchName } from '../../src/lib/sanitize-branch'

describe('sanitizedBranchName', () => {
  it('leaves a good branch name alone', () => {
    const branchName = 'this-is/fine'
    const result = sanitizedBranchName(branchName)
    expect(result).to.equal('this-is/fine')
  })

  it('replaces invalid characters with dashes', () => {
    const branchName = '.this..is\\not fine:yo?|is-it'
    const result = sanitizedBranchName(branchName)
    expect(result).to.equal('this-is-not-fine-yo-is-it')
  })

  it('does not allow branch name to end in slash', () => {
    const branchName = 'hello/'
    const result = sanitizedBranchName(branchName)
    expect(result).to.equal('hello-')
  })

  it('does not allow name to end in `.lock`', () => {
    const branchName = 'foo.lock.lock'
    const result = sanitizedBranchName(branchName)
    expect(result).to.equal('foo.lock-')
  })

  it('replaces newlines with dash', () => {
    const branchName = 'hello\r\nworld'
    const result = sanitizedBranchName(branchName)
    expect(result).to.equal('hello-world')
  })

  it('removes starting dot', () => {
    const branchName = '.first.dot.is.not.ok'
    const result = sanitizedBranchName(branchName)
    expect(result).to.equal('first.dot.is.not.ok')
  })

  it('collapses double dashes', () => {
    const branchName = 'branch  ? -|name'
    const result = sanitizedBranchName(branchName)
    expect(result).to.equal('branch-name')
  })
})
