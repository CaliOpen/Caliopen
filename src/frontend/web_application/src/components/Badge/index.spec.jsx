import React from 'react';
import { shallow } from 'enzyme';
import Badge from './';

describe('component Badge', () => {
  it('render', () => {
    const comp = shallow(<Badge>Foo</Badge>);

    expect(comp.text()).toEqual('Foo');
  });
});
