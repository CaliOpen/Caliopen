import { TagPayload } from '../../types';
import { getCleanedTagCollection } from '.';

describe('getTagLabel', () => {
  describe('getCleanedTagCollection', () => {
    it('should retrieve no tags', () => {
      const tags = [];
      const names = ['foo'];
      expect(getCleanedTagCollection(tags, names)).toEqual([]);
    });
    it('should retrieve tags by names', () => {
      const tags: TagPayload[] = [
        { type: 'user', name: 'foo', label: 'Foo' },
        { type: 'user', name: 'bar', label: 'Bar' },
      ];
      const names = ['foo'];
      expect(getCleanedTagCollection(tags, names)).toEqual([
        { type: 'user', name: 'foo', label: 'Foo' },
      ]);
    });
    it('should retrieve tags by label', () => {
      const tags: TagPayload[] = [
        { type: 'user', name: 'foo', label: 'Foo' },
        { type: 'user', name: 'bar', label: 'Bar' },
      ];
      const names = ['Foo'];
      expect(getCleanedTagCollection(tags, names)).toEqual([
        { type: 'user', name: 'foo', label: 'Foo' },
      ]);
    });
  });
});
