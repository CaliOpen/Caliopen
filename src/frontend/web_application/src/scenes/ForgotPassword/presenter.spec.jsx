import React from 'react';
import { shallow } from 'enzyme';
import Presenter from './presenter';

describe('scene - ForgotPassword', () => {
  const translator = str => str;

  it('render', () => {
    const comp = shallow(
      <Presenter __={translator} />
    );

    expect(comp.text()).toContain('ForgotPasswordForm');
  });
});
