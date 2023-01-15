import React from 'react';
import { shallow } from 'enzyme';
import Subtitle from '.';

describe('component Subtitle', () => {
  it('render', () => {
    const comp = shallow(<Subtitle>Foo</Subtitle>);

    expect(comp.text()).toEqual('Foo');
  });
});
