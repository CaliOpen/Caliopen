import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdvancedSelectFieldGroup from '.';

function Comp() {
  const [val, setVal] = React.useState(undefined);
  const props = {
    selectId: 'test-select',
    dropdownId: 'test-dropdown',
    label: 'Foo',
    options: [
      { label: 'a opt', value: 1 },
      { label: 'b opt', value: 3 },
    ],
    value: val,
    onChange: (selected) => {
      setVal(selected);
    },
    placeholder: 'Choose',
  };

  return <AdvancedSelectFieldGroup {...props} />;
}
describe('component AdvancedSelectFieldGroup', () => {
  // XXX: dropdown event listener make it hard to test
  it.skip('should render', async () => {
    render(<Comp />);

    expect(screen.getAllByRole('option').length).toEqual(2);
    act(() => {
      userEvent.click(screen.getByText('Choose'));
    });

    // click the option
    userEvent.click(await screen.findByRole('button', { name: 'a opt' }));
    // act(() => {
    // });
    act(() => {
      // click the Control
      userEvent.click(screen.getByRole('button', { name: 'a opt' }));
    });
    // click the option
    userEvent.click(screen.getByRole('button', { name: 'b opt' }));
    expect(screen.getByRole('listbox')).not.toBeVisible();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // selected value
    expect(screen.getByRole('button', { name: 'b opt' }));
  });
});
