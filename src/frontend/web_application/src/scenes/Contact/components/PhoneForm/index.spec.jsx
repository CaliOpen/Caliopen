import React from 'react';
import { shallow } from 'enzyme';
import PhoneForm from './';

jest.mock('lingui-react', () => ({
  withI18n: () => whatever => whatever,
}));

describe('component PhoneForm', () => {
  it('init form', () => {
    const props = {
      i18n: { _: (id, values) => id },
      onDelete: jest.fn(),
    };

    const comp = shallow(
      <PhoneForm {...props} />
    );

    expect(comp.text()).toEqual('<FormGrid />');
  });
});
