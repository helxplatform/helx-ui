import { render, screen } from '@testing-library/react';
import App from './app';

test('renders app', () => {
  render(<App />);
  const linkElement = screen.getByText(/© 2021 HeLx/i);
  expect(linkElement).toBeInTheDocument();
});
