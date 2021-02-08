import React from 'react';
import { shallow } from 'enzyme';
import RemoteIdentityEmail from '.';

jest.mock('../../../../modules/settings', () => ({
  WithSettings: ({ render }) => render({}, false),
  withSettings: () => (C) => (props) => <C {...props} />,
}));

describe('component RemoteIdentityEmail', () => {
  it('init form', () => {
    const props = {
      remoteIdentity: {},
      onChange: jest.fn(),
      onDelete: jest.fn(),
      onCancel: jest.fn(),
    };

    const wrapper = shallow(<RemoteIdentityEmail {...props} />).dive();
    expect(wrapper.state().editing).toEqual(true);
  });

  it('existing remoteIdentity', () => {
    const props = {
      remoteIdentity: {
        identity_id: 'foo',
        display_name: 'Foo',
        infos: {},
      },
      onChange: jest.fn(),
      onDelete: jest.fn(),
      onCancel: jest.fn(),
    };

    const wrapper = shallow(<RemoteIdentityEmail {...props} />).dive();
    expect(wrapper.state().editing).toEqual(false);
  });
});
