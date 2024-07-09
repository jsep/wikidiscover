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

export function ok<Value, Error>(value: Value): Result<Value, Error> {
  return { value, error: null };
}

export function err<Value, Error>(error: Error): Result<Value, Error> {
  return { value: null, error };
}
