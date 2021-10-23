import * as React from 'react';
import { screen, render } from '@testing-library/react';
import { shallow } from 'enzyme';
import { AllProviders } from 'test/providers';
import DeviceForm from '.';

describe('component Device DeviceForm', () => {
  it('render', () => {
    const props = {
      device: {},
      onChange: jest.fn(),
      notifySuccess: jest.fn(),
      notifyError: jest.fn(),
      i18n: { _: (id) => id },
    };

    render(<DeviceForm {...props} />, { wrapper: AllProviders });

    expect(screen.getByRole('textbox', { name: 'Name:' }));
    expect(screen.getByRole('combobox', { name: 'Type:' }));
  });

  // input has been disabled
  xdescribe('validates ip', () => {
    it('is valid with simple ip', () => {
      const props = {
        device: {},
        onChange: jest.fn(),
        notifySuccess: jest.fn(),
        notifyError: jest.fn(),
        i18n: { _: (id) => id },
      };

      const comp = shallow(<DeviceForm {...props} />);

      const inst = comp.instance();
      expect(inst.validateIP('192.168.1.1')).toEqual({ isValid: true });
    });

    it('is not valid', () => {
      const props = {
        device: {},
        onChange: jest.fn(),
        notifySuccess: jest.fn(),
        notifyError: jest.fn(),
        i18n: { _: (id) => id },
      };

      const comp = shallow(<DeviceForm {...props} />);

      const inst = comp.instance();
      expect(inst.validateIP('foo')).toEqual({
        isValid: false,
        errors: ['device.feedback.invalid_ip'],
      });
    });
  });
});
