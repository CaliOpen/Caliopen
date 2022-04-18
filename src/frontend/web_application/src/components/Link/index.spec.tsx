import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { AllProviders } from 'test/providers';
import Link from '.';

describe('component Link', () => {
  it('render', () => {
    render(<Link to="/foo">Foo</Link>, { wrapper: AllProviders });

    expect(screen.getByText('Foo')).toBeInTheDocument();
  });
});
