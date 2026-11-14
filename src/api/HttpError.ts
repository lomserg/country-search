import { HttpError } from './HttpError';
export class HttpError extends Error {
  status: number;
  constructor(status: number) {
    super(`HTTP error: ${status}`);
    this.status = status;
    this.name = 'HttpError';
  }
}
