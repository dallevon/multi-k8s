import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header as banner', () => {
  render(<App />);
  const header = screen.getByRole('banner');
  expect(header).toBeInTheDocument();
});
