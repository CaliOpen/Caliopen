import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from 'src/components';
import Dropdown, { withDropdownControl } from '.';

const DropdownControl = withDropdownControl(Button);

function Comp() {
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
}

function CompControlled() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <p>Outside</p>
      <button type="button" onClick={() => setVisible((prev) => !prev)}>
        {visible ? 'Hide' : 'Show'}
      </button>
      <div ref={ref}>Ctrl</div>
      <Dropdown
        id="test-dropdown"
        dropdownControlRef={ref}
        closeOnClick="doNotClose"
        show={visible}
      >
        Hello world
      </Dropdown>
    </>
  );
}

describe('component > Dropdown', () => {
  it('toggle dropdown', async () => {
    render(<Comp />);

    expect(screen.queryByText('Hello world')).not.toBeVisible();
    act(() => {
      userEvent.click(screen.getByRole('button', { name: 'Click' }));
    });
    expect(screen.getByText('Hello world')).toBeVisible();
    act(() => {
      userEvent.click(screen.getByText('Outside'));
    });
    expect(screen.queryByText('Hello world')).not.toBeVisible();
  });

  it('toggles controlled', () => {
    render(<CompControlled />);

    expect(screen.queryByText('Hello world')).not.toBeVisible();
    userEvent.click(screen.getByText('Ctrl'));
    expect(screen.queryByText('Hello world')).not.toBeVisible();
    userEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(screen.getByText('Hello world')).toBeVisible();
    userEvent.click(screen.getByText('Outside'));
    expect(screen.getByText('Hello world')).toBeVisible();
    userEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(screen.queryByText('Hello world')).not.toBeVisible();
  });
});
