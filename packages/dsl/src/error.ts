export class InsufficientDataError extends Error {
  constructor(message: string = 'Insufficient data provided') {
    super(message);
    this.name = 'InsufficientDataError';
  }
}
