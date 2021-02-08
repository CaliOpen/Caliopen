import React from 'react';
import { mount } from 'enzyme';
import Presenter from './presenter';

describe('component Device RevokeDevice', () => {
  it('render', () => {
    const props = {
      device: {},
      revokeDevice: jest.fn(),
      notifyError: jest.fn(),
      notifySuccess: jest.fn(),
    };

    const comp = mount(<Presenter {...props} />);

    expect(comp.find('Button').length).toEqual(1);
  });
});
