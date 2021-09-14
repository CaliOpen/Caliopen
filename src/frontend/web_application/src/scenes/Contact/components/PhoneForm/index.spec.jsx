import React from 'react';
import { shallow } from 'enzyme';
import 'test/unit/lingui-react';
import PhoneForm from '.';

describe('component PhoneForm', () => {
  it('init form', () => {
    const props = {
      i18n: { _: (id, values) => id },
      onDelete: jest.fn(),
    };

    const comp = shallow(<PhoneForm {...props} />).dive();

    expect(comp.text()).toEqual('<FormGrid />');
  });
});
