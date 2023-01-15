import { RuleItem } from 'async-validator';

export const ERR_MIN_MAX = 'ERR_MIN_MAX';
export const ERR_INVALID_CHARACTER = 'ERR_INVALID_CHARACTER';
export const ERR_DOTS = 'ERR_DOTS';
export const ERR_DOUBLE_DOTS = 'ERR_DOUBLE_DOTS';

const descriptor: { username: RuleItem[] } = {
  username: [
    {
      type: 'string',
      min: 3,
      max: 42,
      message: ERR_MIN_MAX,
    },
    // @ts-ignore: old version?
    { type: 'pattern', pattern: /^[^.].*[^.]$/, message: ERR_DOTS }, // https://regex101.com/r/TLUfNZ/2
    // @ts-ignore: old version?
    { type: 'pattern', pattern: /^(?!.*\.\.).*$/, message: ERR_DOUBLE_DOTS }, // https://regex101.com/r/TLUfNZ/3
    {
      // @ts-ignore: old version?
      type: 'pattern',
      pattern: /^[^\s"@`:;<>[\]\\]*$/,
      message: ERR_INVALID_CHARACTER,
    }, // https://regex101.com/r/w5nue1/1
  ],
};

export default descriptor;
