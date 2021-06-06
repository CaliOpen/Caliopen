import { getDropdownStyle } from './getDropdownStyle';

let controlElement;
let dropdownElement;
describe('component DropdownControl - getDropdownStyle', () => {
  beforeEach(() => {
    controlElement = document.createElement('div');
    dropdownElement = document.createElement('div');
  });
  const win = {
    pageYOffset: 0,
    pageXOffset: 0,
    innerWidth: 100,
    innerHeight: 200,
  } as Window;

  it('align right to its controlElement', () => {
    controlElement.getBoundingClientRect = jest.fn(
      () =>
        ({
          x: 80,
          left: 80,
          y: 10,
          top: 10,
          width: 10,
          height: 10,
        } as DOMRect)
    );
    dropdownElement.getBoundingClientRect = jest.fn(
      () =>
        ({
          x: 0,
          left: 0,
          y: 0,
          top: 0,
          width: 50,
          height: 50,
        } as DOMRect)
    );

    const props = {
      controlElement,
      dropdownElement,
      win,
    };

    expect(getDropdownStyle(props)).toEqual({
      left: `${80 + 10 - 50}px`,
      top: '20px',
      position: 'absolute',
    });
  });

  describe('force align', () => {
    beforeEach(() => {
      controlElement.getBoundingClientRect = jest.fn(
        () =>
          ({
            x: 50,
            left: 50,
            y: 10,
            top: 10,
            width: 10,
            height: 10,
          } as DOMRect)
      );
      dropdownElement.getBoundingClientRect = jest.fn(
        () =>
          ({
            x: 0,
            left: 0,
            y: 0,
            top: 0,
            width: 30,
            height: 50,
          } as DOMRect)
      );
    });

    it('align left to its controlElement', () => {
      const props = {
        controlElement,
        dropdownElement,
        win,
      };

      expect(getDropdownStyle(props)).toEqual({
        left: '50px',
        top: '20px',
        position: 'absolute',
      });
    });

    it('force align right', () => {
      const props = {
        alignRight: true,
        controlElement,
        dropdownElement,
        win,
      };

      expect(getDropdownStyle(props)).toEqual({
        left: `${50 + 10 - 30}px`,
        top: '20px',
        position: 'absolute',
      });
    });
  });

  describe('small viewPort', () => {
    it('position fixed', () => {
      controlElement.getBoundingClientRect = jest.fn(
        () =>
          ({
            x: 50,
            left: 50,
            y: 10,
            top: 10,
            width: 10,
            height: 10,
          } as DOMRect)
      );
      dropdownElement.getBoundingClientRect = jest.fn(
        () =>
          ({
            x: 0,
            left: 0,
            y: 0,
            top: 0,
            width: 30,
            height: 210,
          } as DOMRect)
      );
      const props = {
        controlElement,
        dropdownElement,
        win,
      };

      expect(getDropdownStyle(props)).toEqual({
        left: '50px',
        top: '42px',
        position: 'fixed',
        height: `${200 - 42}px`,
      });
    });

    it('width 100%', () => {
      controlElement.getBoundingClientRect = jest.fn(
        () =>
          ({
            x: 50,
            left: 50,
            y: 10,
            top: 10,
            width: 10,
            height: 10,
          } as DOMRect)
      );
      dropdownElement.getBoundingClientRect = jest.fn(
        () =>
          ({
            x: 0,
            left: 0,
            y: 0,
            top: 0,
            width: 110,
            height: 50,
          } as DOMRect)
      );

      const props = {
        controlElement,
        dropdownElement,
        win,
      };

      expect(getDropdownStyle(props)).toEqual({
        left: '0px',
        top: '20px',
        position: 'absolute',
        width: '100%',
      });
    });
  });

  it('align on scroll', () => {
    controlElement.getBoundingClientRect = jest.fn(
      () =>
        ({
          x: 80,
          left: 80,
          y: 10,
          top: 10,
          width: 10,
          height: 10,
        } as DOMRect)
    );
    dropdownElement.getBoundingClientRect = jest.fn(
      () =>
        ({
          x: 0,
          left: 0,
          y: 0,
          top: 0,
          width: 50,
          height: 50,
        } as DOMRect)
    );

    const props = {
      controlElement,
      dropdownElement,
      win,
    };

    expect(getDropdownStyle(props)).toEqual({
      left: `${80 + 10 - 50}px`,
      top: '20px',
      position: 'absolute',
    });
  });
});
