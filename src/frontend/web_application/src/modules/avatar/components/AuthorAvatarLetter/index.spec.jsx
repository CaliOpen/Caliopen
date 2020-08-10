import React from 'react';
import { shallow } from 'enzyme';
import AuthorAvatarLetter from '.';

describe('component ContactAvatarLetter', () => {
  it('render', () => {
    const comp = shallow(
      <AuthorAvatarLetter
        message={{ participants: [{ label: 'Foobar', type: 'From' }] }}
      />
    );

    expect(comp.find('AvatarLetter').length).toEqual(1);
  });
});
