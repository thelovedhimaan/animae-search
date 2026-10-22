import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the anime search entry point', () => {
  render(<App />);
  expect(screen.getByText(/search for anime/i)).toBeInTheDocument();
});
