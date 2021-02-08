// remove non ascii chars, leave chars from 32 to 126 of the ascii table
// https://duckduckgo.com/?q=ascii+table&t=ffab&ia=answer&iax=answer
export const asciify = (str) =>
  str.normalize('NFKD').replace(/[^\x20-\x7E]/g, '');
