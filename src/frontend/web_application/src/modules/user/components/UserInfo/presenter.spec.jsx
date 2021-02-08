import React from 'react';
import { shallow } from 'enzyme';
import Presenter from './presenter';

jest.mock('../../../../modules/settings', () => ({
  WithSettings: ({ render }) => render({}, false),
}));

describe('component UserInfo', () => {
  const user = {
    name: 'Bender',
    contact: {
      title: 'Mr Bender',
      emails: [{ address: 'bender@planetexpress.tld' }],
    },
  };

  it('render', () => {
    const comp = shallow(<Presenter user={user} />);

    expect(comp.find('.m-user-info__username').text()).toContain(user.name);
  });
});
