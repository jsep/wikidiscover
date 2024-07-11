export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string) {
    super('BAD_REQUEST', message);
  }
}

export class WikipediaApiError extends ApiError {
  constructor(message: string) {
    super('WIKIPEDIA_API_ERROR', message);
  }
}

export class TranslationApiError extends ApiError {
  constructor(message: string) {
    super('TRANSLATION_API_ERROR', message);
  }
}
