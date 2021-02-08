import React from 'react';
import { shallow } from 'enzyme';
import Presenter from './presenter';

describe('scene - ForgotPassword', () => {
  const props = {
    i18n: { _: (str) => str },
  };

  it('render', () => {
    const comp = shallow(<Presenter {...props} />).dive();

    expect(comp.text()).toContain('ForgotPasswordForm');
  });
});
