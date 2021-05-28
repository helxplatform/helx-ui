import { render, screen } from '@testing-library/react';
import { App } from './app';

test('renders app', () => {
    render(<App />);
    const linkElement = screen.getByText(/© HeLx 2021/i);
    expect(linkElement).toBeInTheDocument();
});
