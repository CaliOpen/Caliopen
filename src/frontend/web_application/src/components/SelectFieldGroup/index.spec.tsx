import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import SelectFieldGroup from '.';

describe('component SelectFieldGroup', () => {
  it('should render', () => {
    const onValueChanged = jest.fn();
    const props = {
      label: 'Foo',
      options: [
        { label: 'a', value: 1 },
        { label: 'b', value: 3 },
      ],
      value: '',
      onChange: (ev) => {
        onValueChanged(ev?.target.value);
      },
    };

    render(<SelectFieldGroup {...props} />);

    const combobox = screen.getByRole('combobox', { name: 'Foo' });
    expect(combobox).toBeInTheDocument();
    userEvent.selectOptions(combobox, screen.getByText('b'));

    expect(onValueChanged).toHaveBeenCalledWith('3');
  });
});
