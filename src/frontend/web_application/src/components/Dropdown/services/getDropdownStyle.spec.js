import { getDropdownStyle } from './getDropdownStyle';

describe('component DropdownControl - getDropdownStyle', () => {
  const win = {
    pageYOffset: 0,
    pageXOffset: 0,
    innerWidth: 100,
    innerHeight: 200,
  };

  it('align right to its controlElement', () => {
    const props = {
      controlElement: {
        getBoundingClientRect: () => ({
          width: 10,
          height: 10,
          top: 10,
          left: 80,
        }),
      },
      dropdownElement: {
        getBoundingClientRect: () => ({
          width: 50,
          height: 50,
          top: 0,
          left: 0,
        }),
      },
      win,
    };

    expect(getDropdownStyle(props)).toEqual({
      left: 80 + 10 - 50,
      top: 20,
      position: 'absolute',
    });
  });

  describe('force align', () => {
    const controlRect = {
      width: 10,
      height: 10,
      top: 10,
      left: 50,
    };
    const dropdownRect = {
      width: 30,
      height: 50,
      top: 0,
      left: 0,
    };

    it('align left to its controlElement', () => {
      const props = {
        controlElement: {
          getBoundingClientRect: () => controlRect,
        },
        dropdownElement: {
          getBoundingClientRect: () => dropdownRect,
        },
        win,
      };

      expect(getDropdownStyle(props)).toEqual({
        left: 50,
        top: 20,
        position: 'absolute',
      });
    });

    it('force align right', () => {
      const props = {
        alignRight: true,
        controlElement: {
          getBoundingClientRect: () => controlRect,
        },
        dropdownElement: {
          getBoundingClientRect: () => dropdownRect,
        },
        win,
      };

      expect(getDropdownStyle(props)).toEqual({
        left: 50 + 10 - 30,
        top: 20,
        position: 'absolute',
      });
    });
  });

  describe('small viewPort', () => {
    it('position fixed', () => {
      const props = {
        controlElement: {
          getBoundingClientRect: () => ({
            width: 10,
            height: 10,
            top: 10,
            left: 50,
          }),
        },
        dropdownElement: {
          getBoundingClientRect: () => ({
            width: 30,
            height: 210,
            top: 0,
            left: 0,
          }),
        },
        win,
      };

      expect(getDropdownStyle(props)).toEqual({
        left: 50,
        top: 42,
        position: 'fixed',
        height: 200 - 42,
      });
    });

    it('width 100%', () => {
      const props = {
        controlElement: {
          getBoundingClientRect: () => ({
            width: 10,
            height: 10,
            top: 10,
            left: 50,
          }),
        },
        dropdownElement: {
          getBoundingClientRect: () => ({
            width: 110,
            height: 50,
            top: 0,
            left: 0,
          }),
        },
        win,
      };

      expect(getDropdownStyle(props)).toEqual({
        left: 0,
        top: 20,
        position: 'absolute',
        width: '100%',
      });
    });
  });

  it('align on scroll', () => {
    const props = {
      controlElement: {
        getBoundingClientRect: () => ({
          width: 10,
          height: 10,
          top: 10,
          left: 80,
        }),
      },
      dropdownElement: {
        getBoundingClientRect: () => ({
          width: 50,
          height: 50,
          top: 0,
          left: 0,
        }),
      },
      win,
    };

    expect(getDropdownStyle(props)).toEqual({
      left: 80 + 10 - 50,
      top: 20,
      position: 'absolute',
    });
  });
});
