import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header brand', () => {
  render(<App />);
  const brand = screen.getByText(/Tic Tac Toe/i);
  expect(brand).toBeInTheDocument();
});

test('renders reset button', () => {
  render(<App />);
  const btn = screen.getByRole('button', { name: /reset/i });
  expect(btn).toBeInTheDocument();
});
