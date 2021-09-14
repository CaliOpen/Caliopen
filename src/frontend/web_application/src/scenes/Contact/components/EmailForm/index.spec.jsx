import React from 'react';
import { shallow } from 'enzyme';
import 'test/unit/lingui-react';
import EmailForm from '.';

describe('component EmailForm', () => {
  it('init form', () => {
    const props = {
      i18n: { _: (id) => id },
    };

    const comp = shallow(<EmailForm {...props} />).dive();

    expect(comp.text()).toEqual('<FormGrid />');
  });
});
