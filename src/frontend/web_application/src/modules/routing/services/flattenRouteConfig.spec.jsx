import { flattenRouteConfig } from './flattenRouteConfig';

describe('routes "service"', () => {
  describe('flattenRouteConfig', () => {
    it('get a flattened config', () => {
      expect(
        flattenRouteConfig([
          { path: 'a' },
          {
            path: 'b',
            routes: [
              { path: 'b1', routes: [{ path: 'b1I' }] },
              { path: 'b2' },
              { path: 'b3', routes: [{ path: 'b3I' }, { path: 'b3II' }] },
            ],
          },
        ])
      ).toEqual([
        { path: 'a' },
        { path: 'b' },
        { path: 'b1' },
        { path: 'b1I' },
        { path: 'b2' },
        { path: 'b3' },
        { path: 'b3I' },
        { path: 'b3II' },
      ]);
    });
  });
});
