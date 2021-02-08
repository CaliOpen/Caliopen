import React from 'react';
import { shallow } from 'enzyme';
import DeviceProvider from './presenter';

describe('device - DeviceProvider', () => {
  const props = {
    setDeviceGenerated: jest.fn(),
  };

  it('render', () => {
    const comp = shallow(<DeviceProvider {...props}>Foo</DeviceProvider>, {
      disableLifecycleMethods: true,
    });

    expect(comp.text()).toEqual('Foo');
  });
});
