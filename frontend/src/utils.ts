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
  return date.toLocaleDateString(lang, options);
}
