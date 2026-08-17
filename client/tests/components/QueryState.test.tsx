import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryEmptyState, QueryErrorState } from '~/components/QueryState';

describe('QueryEmptyState', () => {
  it('renders default label', () => {
    render(<QueryEmptyState />);
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<QueryEmptyState label="No results found" />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(<QueryEmptyState className="mt-8" />);
    expect(container.firstChild).toHaveClass('mt-8');
  });
});

describe('QueryErrorState', () => {
  it('renders default error message', () => {
    render(<QueryErrorState />);
    expect(
      screen.getByText('Something went wrong. Please try again later.'),
    ).toBeInTheDocument();
  });

  it('renders custom error message', () => {
    render(<QueryErrorState message="Network error" />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders retry button when onRetry provided', () => {
    let clicked = false;
    render(<QueryErrorState onRetry={() => { clicked = true; }} />);
    const btn = screen.getByText('Try again');
    expect(btn).toBeInTheDocument();
    btn.click();
    expect(clicked).toBe(true);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<QueryErrorState />);
    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(<QueryErrorState className="mt-4" />);
    expect(container.firstChild).toHaveClass('mt-4');
  });
});
