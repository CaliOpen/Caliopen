import React from 'react';
import { shallow } from 'enzyme';
import Icon from '.';

describe('component Icon', () => {
  it('render', () => {
    const comp = shallow(<Icon type="edit" />);

    expect(comp.find('i').hasClass('fa-edit')).toEqual(true);
  });
});
