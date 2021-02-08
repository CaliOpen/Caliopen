import React from 'react';
import { shallow } from 'enzyme';
import RadioFieldGroup from '.';

describe('component RadioFieldGroup', () => {
  it('render', () => {
    const props = {
      name: 'my_radio',
      options: [
        { label: 'a', value: 1 },
        { label: 'b', value: 3 },
      ],
      value: 3,
      onChange: jest.fn(),
    };

    const comp = shallow(<RadioFieldGroup {...props} />);

    expect(comp.find('input').length).toEqual(2);
    expect(comp.find('input[value=3]').prop('checked')).toEqual(true);
    comp.find('input[value=1]').simulate('change');
    expect(props.onChange).toHaveBeenCalled();
  });
});
