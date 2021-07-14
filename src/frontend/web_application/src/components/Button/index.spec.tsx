import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '.';

describe('component Button', () => {
  it('should render', () => {
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Foo</Button>);

    userEvent.click(screen.getByText('Foo'));
    expect(handleClick).toHaveBeenCalled();
  });
});
