import React from 'react';
import { shallow } from 'enzyme';
import Presenter from './index';

describe('component DefList', () => {
  it('render', () => {
    const props = {
      definitions: [
        { title: 'A', descriptions: ['A.1', 'A.2'] },
        { title: 'B', descriptions: ['B.1'] },
      ],
    };

    const comp = shallow(<Presenter {...props} />);

    expect(comp.find('dt').first().text()).toEqual('A');
    expect(comp.find('dt').length).toEqual(2);
    expect(comp.find('dd').length).toEqual(3);
  });
});
