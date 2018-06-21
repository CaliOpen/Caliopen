import React from 'react';
import { shallow } from 'enzyme';
import ImForm from './';

jest.mock('lingui-react', () => ({
  withI18n: () => whatever => whatever,
}));

describe('component ImForm', () => {
  it('init form', () => {
    const props = {
      onDelete: jest.fn(),
      i18n: { _: (id, values) => id },
    };

    const comp = shallow(
      <ImForm {...props} />
    );

    expect(comp.text()).toEqual('<FormGrid />');
  });
});
