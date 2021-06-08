import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from 'src/components';
import Dropdown, { withDropdownControl } from '.';

const DropdownControl = withDropdownControl(Button);

const Comp = () => {
  const ref = React.useRef<HTMLButtonElement>(null);

  return (
    <>
      <p>Outside</p>
      <DropdownControl ref={ref}>Click</DropdownControl>
      <Dropdown id="test-dropdown" dropdownControlRef={ref}>
        Hello world
      </Dropdown>
    </>
  );
};

describe('component > Dropdown', () => {
  it('toggle dropdown', async () => {
    render(<Comp />);

    expect(screen.queryByText('Hello world')).not.toBeVisible();

    userEvent.click(screen.getByRole('button', { name: 'Click' }));
    expect(screen.getByText('Hello world')).toBeVisible();
    userEvent.click(screen.getByText('Outside'));
    expect(screen.queryByText('Hello world')).not.toBeVisible();
  });
});
