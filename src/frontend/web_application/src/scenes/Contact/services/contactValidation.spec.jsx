import { contactValidation } from './contactValidation';

describe('contact scene - services - contactValidation', () => {
  it('init', () => {
    const values = {};
    expect(contactValidation(values)).toEqual({});
  });
  describe('test identities', () => {
    it('fails on bad Twitter handle', () => {
      const values = {
        identities: [
          { type: 'twitter', name: '@foo' },
          { type: 'twitter', name: 'foo' },
          { type: 'twitter', name: 'https://twitter.com/foo' },
        ],
      };
      expect(contactValidation(values).identities.length).toEqual(3);
      expect(contactValidation(values).identities[1]).toBeUndefined();
    });
    it('works with good Twitter handle', () => {
      const values = {
        identities: [{ type: 'twitter', name: 'foo' }],
      };
      expect(contactValidation(values).identities[0]).toBeUndefined();
    });
  });
});
