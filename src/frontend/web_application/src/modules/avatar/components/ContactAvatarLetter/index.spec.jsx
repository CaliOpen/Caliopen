import React from 'react';
import { shallow } from 'enzyme';
import ContactAvatarLetter from '.';

describe('component ContactAvatarLetter', () => {
  it('render', () => {
    const comp = shallow(<ContactAvatarLetter contact={{ title: 'Foobar' }} />);

    expect(comp.find('AvatarLetter').length).toEqual(1);
  });
});
