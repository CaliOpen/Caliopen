import { toNumber } from 'lodash';

type Value = string | number;
type TResult = Record<string, undefined | Value | Value[]>;

export function getSearchParams(queryString: string): TResult {
  const paramsIterator = new URLSearchParams(queryString);
  const res: TResult = {};
  paramsIterator.forEach((_val, key) => {
    const values = paramsIterator
      .getAll(key)
      .map((value) =>
        Number.isFinite(parseFloat(value)) ? toNumber(value) : value
      );
    res[key] = values.length > 1 ? values : values[0];
  });

  return res;
}
