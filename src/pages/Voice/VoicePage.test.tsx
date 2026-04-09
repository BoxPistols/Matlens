import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { VoicePage } from './VoicePage';

describe('VoicePage', () => {
  it('renders disabled message', () => {
    render(<VoicePage />);
    expect(
      screen.getByText('音声モードは現在無効です'),
    ).toBeInTheDocument();
  });
});
