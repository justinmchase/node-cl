export class ExecError extends Error {
  constructor(cmd, code) {
    super(`Command "${cmd}" exited with code ${code}`)
    this.cmd = cmd
    this.code = code
    this.name = 'ExecError'
  }
}
