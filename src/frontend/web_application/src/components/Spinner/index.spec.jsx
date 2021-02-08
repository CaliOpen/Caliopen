import React from 'react';
import { shallow } from 'enzyme';
import Spinner from '.';

describe('component Spinner', () => {
  it('render', () => {
    const comp = shallow(<Spinner isLoading />);

    expect(comp.find('svg').length).toEqual(1);
  });
});
