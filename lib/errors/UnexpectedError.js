export class UnexpectedError extends Error {
  constructor(type, value) {
    super(`Unexpected ${type} value ${value}`)
    this.name = 'UnexpectedError'
  }
}
