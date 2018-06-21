import React from 'react';
import { shallow } from 'enzyme';
import Presenter from './presenter';

describe('component NavigationAlt', () => {
  const applications = [];
  const translate = str => str;

  it('render', () => {
    const currentApplication = {};

    const comp = shallow(
      <Presenter
        applications={applications}
        currentApplication={currentApplication}
        i18n={{ _: translate }}
        onClickApp={ jest.fn() }
      />
    );

    expect(comp.text()).toContain('UserInfo');
    expect(comp.find('VerticalMenu').length).toEqual(3);
  });
});
