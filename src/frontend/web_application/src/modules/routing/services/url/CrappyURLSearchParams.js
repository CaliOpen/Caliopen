const splitSearch = (search) =>
  (search.indexOf('?') !== -1 ? search.split('?')[1] : search)
    .split('&')
    .map((keyValue) => keyValue.split('='));

export default class CrappyURLSearchParams {
  constructor(search) {
    this.map = new Map(splitSearch(search));
  }

  get(name) {
    return this.map.get(name);
  }

  [Symbol.iterator]() {
    return this.map[Symbol.iterator]();
  }
}
