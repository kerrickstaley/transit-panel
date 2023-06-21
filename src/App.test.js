import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loading config text', () => {
  render(<App />);
  const loadingConfigDiv = screen.getByText(/loading config/i);
  expect(loadingConfigDiv).toBeInTheDocument();
});
