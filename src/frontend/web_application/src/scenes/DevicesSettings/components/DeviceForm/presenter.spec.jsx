import React from 'react';
import { shallow } from 'enzyme';
import Presenter from './presenter';

describe('component Device DeviceForm', () => {
  it('render', () => {
    const props = {
      device: {},
      onChange: jest.fn(),
      notifySuccess: jest.fn(),
      notifyError: jest.fn(),
      i18n: { _: (id) => id },
    };

    const comp = shallow(<Presenter {...props} />);

    expect(comp.find('TextFieldGroup').length).toEqual(1);
    expect(comp.find('SelectFieldGroup').length).toEqual(1);
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

      const comp = shallow(<Presenter {...props} />);

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

      const comp = shallow(<Presenter {...props} />);

      const inst = comp.instance();
      expect(inst.validateIP('foo')).toEqual({
        isValid: false,
        errors: ['device.feedback.invalid_ip'],
      });
    });
  });
});
