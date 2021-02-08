import getClassName from './index';

describe('Service Helper StylesheetHelper', () => {
  describe('getClassName', () => {
    it('make stylesheet class from undefined', () => {
      expect(getClassName()).toEqual('m-letter--none');
    });

    it('make stylesheet class from standard letter', () => {
      expect(getClassName('fry')).toEqual('m-letter--f');
    });

    it('make stylesheet class from non-standard letter', () => {
      expect(getClassName('ß-Ligatur')).toEqual('m-letter--none');
    });
  });
});
