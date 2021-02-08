import React from 'react';
import { shallow } from 'enzyme';
import Textarea from '.';

describe('component Textarea', () => {
  it('should render', () => {
    const props = {
      onChange: jest.fn(),
    };

    const comp = shallow(<Textarea {...props} />);

    expect(comp.find('textarea').length).toEqual(1);
    comp.find('textarea').simulate('change');
    expect(props.onChange).toHaveBeenCalled();
  });
});
