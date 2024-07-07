export type IsoDateString = string;

export function dateToIso(date: Date): IsoDateString {
  return date.toISOString().split("T")[0];
}
