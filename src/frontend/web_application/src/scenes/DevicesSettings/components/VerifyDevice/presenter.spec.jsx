import React from 'react';
import { mount } from 'enzyme';
import Presenter from './presenter';

jest.mock('../../../../modules/userNotify', () => ({
  withNotification: () => (noop) => noop,
}));

describe('component Device VerifyDevice', () => {
  it('render', () => {
    const props = {
      device: {},
      onDeleteDevice: jest.fn(),
      onVerifyDevice: jest.fn(),
      notifySuccess: jest.fn(),
    };

    const comp = mount(<Presenter {...props} />);

    expect(comp.find('Button').length).toEqual(1);
  });
});
