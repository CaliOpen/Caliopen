import React from 'react';
import { shallow } from 'enzyme';
import Presenter from './presenter';

jest.mock('lingui-react', () => ({
  withI18n: () => whatever => whatever,
}));

describe('scene - Signin', () => {
  const props = {
    i18n: { t: str => str },
    onSignupSuccess: jest.fn(),
    settings: {},
  };

  it('render', () => {
    const comp = shallow(
      <Presenter {...props} />
    );

    expect(comp.text()).toContain('SignupForm');
  });
});
