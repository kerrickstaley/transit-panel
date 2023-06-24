import { render, screen } from '@testing-library/react';
import App from './App';

test('renders config param not specified text', () => {
  render(<App />);
  const configNotSpecifiedDiv = screen.getByText(/config.*not specified/i);
  expect(configNotSpecifiedDiv).toBeInTheDocument();
});
