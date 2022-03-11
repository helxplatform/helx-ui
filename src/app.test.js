import { render, screen } from '@testing-library/react';
import { NotFoundView } from './views/';

test('renders app', () => {
    render(<NotFoundView />);
    const linkElement = screen.getByText(/ERROR 404/i);
    expect(linkElement).toBeInTheDocument();
});
