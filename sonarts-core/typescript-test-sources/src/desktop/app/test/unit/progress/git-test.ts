import { expect } from 'chai'

import { GitProgressParser, IGitProgress, IGitProgressInfo } from '../../../src/lib/progress'
import { parse } from '../../../src/lib/progress/git'

describe('GitProgressParser', () => {

  it('requires at least one step', () => {
    expect(() => new GitProgressParser([])).to.throw()
  })

  it('parses progress with one step', () => {

    const parser = new GitProgressParser([
      { title: 'remote: Compressing objects', weight: 1 },
    ])

    expect(parser.parse('remote: Compressing objects:  72% (16/22)'))
      .to.have.property('percent', 16 / 22)
  })

  it('parses progress with several steps', () => {

    const parser = new GitProgressParser([
      { title: 'remote: Compressing objects', weight: 0.5 },
      { title: 'Receiving objects', weight: 0.5 },
    ])

    let result

    result = parser.parse('remote: Compressing objects:  72% (16/22)')

    expect(result.kind).to.equal('progress')
    expect((result as IGitProgress).percent).to.equal(16 / 22 / 2)

    result = parser.parse('Receiving objects:  99% (166741/167587), 267.24 MiB | 2.40 MiB/s')

    expect(result.kind).to.equal('progress')
    expect((result as IGitProgress).percent).to.equal(0.5 + (166741 / 167587 / 2))
  })

  it('enforces ordering of steps', () => {

    const parser = new GitProgressParser([
      { title: 'remote: Compressing objects', weight: 0.5 },
      { title: 'Receiving objects', weight: 0.5 },
    ])

    let result

    result = parser.parse('remote: Compressing objects:  72% (16/22)')

    expect(result.kind).to.equal('progress')
    expect((result as IGitProgress).percent).to.equal(16 / 22 / 2)

    result = parser.parse('Receiving objects:  99% (166741/167587), 267.24 MiB | 2.40 MiB/s')

    expect(result.kind).to.equal('progress')
    expect((result as IGitProgress).percent).to.equal(0.5 + (166741 / 167587 / 2))

    result = parser.parse('remote: Compressing objects:  72% (16/22)')

    expect(result.kind).to.equal('context')
  })
})

describe('progress parser', () => {
  it('parses progress with no total', () => {
    const result = parse('remote: Counting objects: 167587')

    expect(result).to.deep.equal(<IGitProgressInfo>{
      title: 'remote: Counting objects',
      text: 'remote: Counting objects: 167587',
      value: 167587,
      done: false,
      percent: undefined,
      total: undefined,
    })
  })

  it('parses final progress with no total', () => {
    const result = parse('remote: Counting objects: 167587, done.')

    expect(result).to.deep.equal(<IGitProgressInfo>{
      title: 'remote: Counting objects',
      text: 'remote: Counting objects: 167587, done.',
      value: 167587,
      done: true,
      percent: undefined,
      total: undefined,
    })
  })

  it('parses progress with total', () => {
    const result = parse('remote: Compressing objects:  72% (16/22)')

    expect(result).to.deep.equal(<IGitProgressInfo>{
      title: 'remote: Compressing objects',
      text: 'remote: Compressing objects:  72% (16/22)',
      value: 16,
      done: false,
      percent: 72,
      total: 22,
    })
  })

  it('parses final with total', () => {
    const result = parse('remote: Compressing objects: 100% (22/22), done.')

    expect(result).to.deep.equal(<IGitProgressInfo>{
      title: 'remote: Compressing objects',
      text: 'remote: Compressing objects: 100% (22/22), done.',
      value: 22,
      done: true,
      percent: 100,
      total: 22,
    })
  })

  it('parses with total and throughput', () => {
    const result = parse('Receiving objects:  99% (166741/167587), 267.24 MiB | 2.40 MiB/s')

    expect(result).to.deep.equal(<IGitProgressInfo>{
      title: 'Receiving objects',
      text: 'Receiving objects:  99% (166741/167587), 267.24 MiB | 2.40 MiB/s',
      value: 166741,
      done: false,
      percent: 99,
      total: 167587,
    })
  })

  it('parses final with total and throughput', () => {
    const result = parse('Receiving objects: 100% (167587/167587), 279.67 MiB | 2.43 MiB/s, done.')

    expect(result).to.deep.equal(<IGitProgressInfo>{
      title: 'Receiving objects',
      text: 'Receiving objects: 100% (167587/167587), 279.67 MiB | 2.43 MiB/s, done.',
      value: 167587,
      done: true,
      percent: 100,
      total: 167587,
    })
  })

  it('does not parse things that aren\'t progress', () => {
    const result = parse('remote: Total 167587 (delta 19), reused 11 (delta 11), pack-reused 167554         ')
    expect(result).to.be.null
  })
})
