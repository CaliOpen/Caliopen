import * as React from 'react';
import { render, screen } from '@testing-library/react';
import Spinner from '.';

describe('component Spinner', () => {
  it('render', () => {
    render(<Spinner svgTitleId="page-spinner" isLoading />);

    expect(screen.getByText('Loading …')).toBeInTheDocument();
  });

  it('does not render', () => {
    render(<Spinner svgTitleId="page-spinner" isLoading={false} />);

    expect(screen.queryByText('Loading …')).not.toBeInTheDocument();
  });
});
