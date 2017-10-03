export function validateModelName (modelName: string): boolean {
  // model name should start with a capital letter and only contains alphanumeric characters
  return /^[A-Z]/.test(modelName) && /^[a-zA-Z0-9]+$/.test(modelName)
}

export function validateEnumName (modelName: string): boolean {
  // model name should start with a capital letter and only contains alphanumeric characters
  return /^[A-Z]/.test(modelName) && /^[a-zA-Z0-9_]+$/.test(modelName)
}

export function validateRelationName (modelName: string): boolean {
  // model name should start with a capital letter and only contains alphanumeric characters
  return /^[A-Z]/.test(modelName) && /^[a-zA-Z0-9]+$/.test(modelName)
}

export function validateProjectName (projectName: string): boolean {
  // project name should start with a capital letter and only contains alphanumberic characters and space
  return /^[A-Z]/.test(projectName) && /^[a-zA-Z0-9 ]+$/.test(projectName)
}

export function validateFieldName (fieldName: string): boolean {
  return /^[a-z]/.test(fieldName) && /^[a-zA-Z0-9]+$/.test(fieldName)
}
