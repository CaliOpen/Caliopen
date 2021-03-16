import * as React from 'react';
import { render, screen } from '@testing-library/react';
import Spinner from '.';

describe('component Spinner', () => {
  it('render', () => {
    render(<Spinner isLoading />);

    expect(screen.getByText('Loading …')).toBeVisible();
  });

  it('does not render', () => {
    render(<Spinner isLoading={false} />);

    expect(screen.queryByText('Loading …')).not.toBeVisible();
  });
});
