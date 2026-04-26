export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {}

export class ConflictError extends AppError {}

export class ValidationError extends AppError {}

export class UnprocessableError extends AppError {}
