
import '../polyfils'
import * as nameValidator from '../nameValidator'

describe('nameValidator', () => {
  it('should deny an empty model name', () => {
    expect(nameValidator.validateModelName('')).toBe(false)
  })

  it('should deny model names not starting with a capital letter', () => {
    expect(nameValidator.validateModelName('model')).toBe(false)
    expect(nameValidator.validateModelName('m')).toBe(false)
  })

  it('should allow model names with numbers', () => {
    expect(nameValidator.validateModelName('Model1')).toBe(true)
    expect(nameValidator.validateModelName('1')).toBe(false)
    expect(nameValidator.validateModelName('1model')).toBe(false)
    expect(nameValidator.validateModelName('Mod1el')).toBe(true)
  })

  it('should deny model names containing spaces', () => {
    expect(nameValidator.validateModelName('my model')).toBe(false)
    expect(nameValidator.validateModelName(' mymodel')).toBe(false)
    expect(nameValidator.validateModelName('mymodel ')).toBe(false)
  })

  it('should deny model names containing special characters', () => {
    expect(nameValidator.validateModelName('Mymodel#')).toBe(false)
    expect(nameValidator.validateModelName('Mym*odel')).toBe(false)
    expect(nameValidator.validateModelName('Mym~odel')).toBe(false)
    expect(nameValidator.validateModelName('Mym"odel')).toBe(false)
    expect(nameValidator.validateModelName('Mym§odel')).toBe(false)
    expect(nameValidator.validateModelName('Mym/odel')).toBe(false)
    expect(nameValidator.validateModelName('Mym&odel')).toBe(false)
    expect(nameValidator.validateModelName('Mym%odel')).toBe(false)
    expect(nameValidator.validateModelName('Mym(odel')).toBe(false)
    expect(nameValidator.validateModelName('Mym)odel')).toBe(false)
    expect(nameValidator.validateModelName('Mym=odel')).toBe(false)
    expect(nameValidator.validateModelName('Mym?odel')).toBe(false)
  })

  it('should accept model names starting with a capital letter that only contains letters', () => {
    expect(nameValidator.validateModelName('Model')).toBe(true)
    expect(nameValidator.validateModelName('MyModel')).toBe(true)
    expect(nameValidator.validateModelName('M')).toBe(true)
    expect(nameValidator.validateModelName('MySuperExtraDuperHyperMegaLongModelNameIsSuperCoolAndSuperAwesome'))
      .toBe(true)
  })

  it('should accept model names with multiple capital letters in row', () => {
    expect(nameValidator.validateModelName('ABC')).toBe(true)
    expect(nameValidator.validateModelName('MYSUPERMODEL')).toBe(true)
    expect(nameValidator.validateModelName('WTFModel')).toBe(true)
  })

  it('should deny an empty project name', () => {
    expect(nameValidator.validateProjectName('')).toBe(false)
  })

  it('should deny project names not starting with a capital letter', () => {
    expect(nameValidator.validateProjectName('project')).toBe(false)
  })

  it('should deny project names starting with a number', () => {
    expect(nameValidator.validateProjectName('1')).toBe(false)
    expect(nameValidator.validateProjectName('1Project')).toBe(false)
    expect(nameValidator.validateProjectName('1 Project')).toBe(false)
    expect(nameValidator.validateProjectName('1 ')).toBe(false)
  })

  it('should deny project names starting with a space', () => {
    expect(nameValidator.validateProjectName(' my project')).toBe(false)
    expect(nameValidator.validateProjectName(' myproject')).toBe(false)
    expect(nameValidator.validateProjectName(' myproject ')).toBe(false)
    expect(nameValidator.validateProjectName(' 1myproject ')).toBe(false)
    expect(nameValidator.validateProjectName(' myproject1')).toBe(false)
  })

  it('should deny project names ending with a space', () => {
    expect(nameValidator.validateProjectName('my project ')).toBe(false)
    expect(nameValidator.validateProjectName('myproject ')).toBe(false)
    expect(nameValidator.validateProjectName('1myproject ')).toBe(false)
    expect(nameValidator.validateProjectName('myproject1 ')).toBe(false)
  })

  it('should deny project names containing special characters', () => {
    expect(nameValidator.validateProjectName('Myproject#')).toBe(false)
    expect(nameValidator.validateProjectName('Myp*roject')).toBe(false)
    expect(nameValidator.validateProjectName('Myp~roject')).toBe(false)
    expect(nameValidator.validateProjectName('Myp"roject')).toBe(false)
    expect(nameValidator.validateProjectName('Myp§roject')).toBe(false)
    expect(nameValidator.validateProjectName('Myp/roject')).toBe(false)
    expect(nameValidator.validateProjectName('Myp&roject')).toBe(false)
    expect(nameValidator.validateProjectName('Myp%roject')).toBe(false)
    expect(nameValidator.validateProjectName('Myp(roject')).toBe(false)
    expect(nameValidator.validateProjectName('Myp)roject')).toBe(false)
    expect(nameValidator.validateProjectName('Myp=roject')).toBe(false)
    expect(nameValidator.validateProjectName('Myp?roject')).toBe(false)
  })

  it('should allow project names containing numbers', () => {
    expect(nameValidator.validateProjectName('My 1st Project')).toBe(true)
    expect(nameValidator.validateProjectName('My 22nd and 23rd Project')).toBe(true)
    expect(nameValidator.validateProjectName('A12334566')).toBe(true)
    expect(nameValidator.validateProjectName('ABC123ABC')).toBe(true)
  })

  it('should allow project names containing spaces', () => {
    expect(nameValidator.validateProjectName('My project')).toBe(true)
    expect(nameValidator.validateProjectName('My Super Project')).toBe(true)
    expect(nameValidator.validateProjectName('My Super Awesome 2nd Project')).toBe(true)
  })

  it('should allow long project names', () => {
    expect(nameValidator.validateProjectName('My project is the very best Like no one ever was' +
      ' To catch them is my real test' +
      ' To train them is my cause')).toBe(true)
  })

  it(
    'should allow project names starting with a capital letter and only containing alphanumberic letters and space',
    () => {
      expect(nameValidator.validateProjectName('My PROJECT')).toBe(true)
      expect(nameValidator.validateProjectName('My Cool Project is Cool')).toBe(true)
      expect(nameValidator.validateProjectName('My 12341487096th Project')).toBe(true)
    })
})
