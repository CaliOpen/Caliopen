import CrappyURLSearchParams from './CrappyURLSearchParams';

describe('CrappyURLSearchParams', () => {
  describe('acts like a URLSearchParams', () => {
    it('get', () => {
      expect(
        new CrappyURLSearchParams('?foo=bar&hello=world').get('hello')
      ).toEqual('world');
    });

    it('cast in array', () => {
      const iterator = new CrappyURLSearchParams('?foo=bar&hello=world');
      expect(Array.from(iterator)).toEqual([
        ['foo', 'bar'],
        ['hello', 'world'],
      ]);
    });
  });
});
