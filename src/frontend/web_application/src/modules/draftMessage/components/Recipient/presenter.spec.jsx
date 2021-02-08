import React from 'react';
import { shallow } from 'enzyme';
import Recipient from './presenter';

describe('component Recipient', () => {
  const props = {
    i18n: { _: (id) => id },
  };

  it('render', () => {
    const participant = {
      address: 'foo@bar.tld',
      label: 'foobar',
    };
    const comp = shallow(<Recipient participant={participant} {...props} />);

    expect(comp.find('Badge').length).toEqual(1);
  });
});
