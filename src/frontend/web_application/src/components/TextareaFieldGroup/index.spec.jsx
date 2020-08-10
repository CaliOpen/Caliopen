import React from 'react';
import { shallow } from 'enzyme';
import TextareaFieldGroup from '.';

describe('component TextareaFieldGroup', () => {
  it('should render', () => {
    const props = {
      label: 'Foo',
      inputProps: {
        onChange: jest.fn(),
      },
    };

    const comp = shallow(<TextareaFieldGroup {...props} />);

    expect(comp.find('FieldGroup').length).toEqual(1);
    expect(comp.find('Textarea').length).toEqual(1);
  });
});
