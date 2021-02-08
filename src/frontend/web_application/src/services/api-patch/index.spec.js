import calcObjectForPatch from './index';

describe('Service calcObjectForPatch', () => {
  describe('update simple fields', () => {
    it('give infos from name', () => {
      const previous = { foo: 'bar' };
      const updated = { foo: 'foo' };

      expect(calcObjectForPatch(updated, previous)).toEqual({
        foo: 'foo',
        current_state: {
          foo: 'bar',
        },
      });
    });

    it('handle undefined as new value', () => {
      const previous = { foo: 'bar' };
      const updated = {};

      expect(calcObjectForPatch(updated, previous)).toEqual({
        current_state: {
          foo: 'bar',
        },
      });
    });

    it('handle undefined as previous value', () => {
      const updated = { foo: 'bar' };
      const previous = {};

      expect(calcObjectForPatch(updated, previous)).toEqual({
        foo: 'bar',
        current_state: {},
      });
    });
  });

  describe('update sub-object', () => {
    it('does not update sub-object clone', () => {
      const previous = { foo: { value: 'bar' } };
      const updated = { ...previous, foo: { ...previous.foo } };

      expect(calcObjectForPatch(updated, previous)).toEqual({
        current_state: {},
      });
    });

    describe('does not calc difference for sub-objects', () => {
      it('has a new property', () => {
        const sub = { a: 1 };
        const previous = { foo: { sub }, bar: 'hello' };
        const updated = { ...previous, foo: { ...sub, b: 2 } };

        expect(calcObjectForPatch(updated, previous)).toEqual({
          foo: { ...updated.foo },
          current_state: { foo: { ...previous.foo } },
        });
      });

      it('has a changed property', () => {
        const sub = { a: 1, b: 2 };
        const previous = { foo: { sub }, bar: 'hello' };
        const updated = { ...previous, foo: { ...sub, b: 3 } };

        expect(calcObjectForPatch(updated, previous)).toEqual({
          foo: { ...updated.foo },
          current_state: { foo: { ...previous.foo } },
        });
      });
    });
  });
});
