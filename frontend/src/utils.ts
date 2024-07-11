// TODO dry and share utils files
export type IsoDateString = string;

export function dateToIso(date: Date): IsoDateString {
  return date.toISOString().split('T')[0];
}

export function dateToFriendly(date: Date, lang: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const utcDate = date.toUTCString();
  return new Date(utcDate).toLocaleDateString(lang, options);
}

export function numberToLocaleString(number: number, lang: string): string {
  return number.toLocaleString(lang);
}

export type Result<T, Err> =
  | { error: null; value: T }
  | { error: Err; value: null };

export async function attemptAsync<T, Err = Error>(
  fun: () => Promise<T>,
): Promise<Result<T, Err>> {
  try {
    return {
      error: null,
      value: await fun(),
    };
  } catch (error) {
    return {
      error: error as Err,
      value: null,
    };
  }
}

export function nonNull<T>(value: T | null | undefined): T {
  if (value == null) {
    throw new Error('Value is null or undefined');
  }
  return value;
}

export function attempt<T, Err = Error>(fun: () => T): Result<T, Err> {
  try {
    return {
      error: null,
      value: fun(),
    };
  } catch (error) {
    return {
      error: error as Err,
      value: null,
    };
  }
}

export function ok<Value, Err = Error>(value: Value): Result<Value, Err> {
  return { value, error: null };
}

export function err<Error, Value = null>(error: Error): Result<Value, Error> {
  return { value: null, error };
}
