import React from 'react';
import { shallow } from 'enzyme';
import Presenter from './presenter';

describe('component Device DeviceInformation', () => {
  it('render current device', () => {
    const props = {
      device: {},
      i18n: { _: (id) => id },
      isCurrentDevice: true,
    };

    const comp = shallow(<Presenter {...props} />);

    expect(comp.find('.m-device-information__current-device').length).toEqual(
      1
    );
  });
});
