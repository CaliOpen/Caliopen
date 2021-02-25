import { toNumber } from 'lodash';

type Value = string | number;
type TResult = {
  [key: string]: Value | Value[];
};

export function getSearchParams(queryString: string): TResult {
  const paramsIterator = new URLSearchParams(queryString);
  const res: TResult = {};
  paramsIterator.forEach((value, key) => {
    const values = paramsIterator
      .getAll(key)
      .map((value) => (isFinite(parseFloat(value)) ? toNumber(value) : value));
    res[key] = values.length > 1 ? values : values[0];
  });

  return res;
}
