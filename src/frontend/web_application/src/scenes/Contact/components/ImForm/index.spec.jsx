import React from 'react';
import { shallow } from 'enzyme';
import ImForm from '.';

describe('component ImForm', () => {
  it('init form', () => {
    const props = {
      onDelete: jest.fn(),
      i18n: { _: (id, values) => id },
    };

    const comp = shallow(<ImForm {...props} />).dive();

    expect(comp.text()).toEqual('<FormGrid />');
  });
});
