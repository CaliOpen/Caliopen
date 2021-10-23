import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextFieldGroup from '.';

describe('component TextFieldGroup', () => {
  it('should render', () => {
    const cb = jest.fn();
    const handleChange = (ev) => cb(ev.target.value);

    render(
      <TextFieldGroup
        id="test"
        label="foo"
        inputProps={{ onChange: handleChange }}
      />
    );

    userEvent.type(screen.getByRole('textbox', { name: 'foo' }), 'hello');
    expect(cb).toHaveBeenCalledWith('hello');
  });
});
