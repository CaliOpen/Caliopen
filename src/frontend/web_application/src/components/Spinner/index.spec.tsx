import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { AllProviders } from 'test/providers';
import Spinner from '.';

describe('component Spinner', () => {
  it('render', () => {
    render(<Spinner svgTitleId="page-spinner" isLoading />, {
      wrapper: AllProviders,
    });

    expect(screen.getByText('Loading …')).toBeInTheDocument();
  });

  it('does not render', () => {
    render(<Spinner svgTitleId="page-spinner" isLoading={false} />, {
      wrapper: AllProviders,
    });

    expect(screen.queryByText('Loading …')).not.toBeInTheDocument();
  });
});
