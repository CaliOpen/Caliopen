import React from 'react';
import { shallow } from 'enzyme';
import Presenter from './presenter';

jest.mock('lingui-react', () => ({
  withI18n: () => whatever => whatever,
}));

describe('scene - ForgotPassword', () => {
  const props = {
    i18n: { _: str => str },
  };

  it('render', () => {
    const comp = shallow(
      <Presenter {...props} />
    );

    expect(comp.text()).toContain('ForgotPasswordForm');
  });
});
