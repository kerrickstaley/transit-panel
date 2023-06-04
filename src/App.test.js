import { render, screen } from '@testing-library/react';
import App from './App';

test('renders fullscreen button', () => {
  render(<App />);
  const fullscreenButton = screen.getByText(/Click to go fullscreen/i);
  expect(fullscreenButton).toBeInTheDocument();
});
