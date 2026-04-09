import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Button,
  Badge,
  Card,
  SectionCard,
  Input,
  Select,
  Textarea,
  Checkbox,
  UnitInput,
  FormGroup,
  ProgressBar,
  Typing,
  Kbd,
} from './atoms';

/* ------------------------------------------------------------------ */
/*  Button                                                             */
/* ------------------------------------------------------------------ */
describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-surface');
  });

  it('applies primary variant classes', () => {
    render(<Button variant="primary">Primary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-accent');
  });

  it('applies ai variant classes', () => {
    render(<Button variant="ai">AI</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-ai');
  });

  it('applies vec variant classes', () => {
    render(<Button variant="vec">Vec</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-vec');
  });

  it('applies danger variant classes', () => {
    render(<Button variant="danger">Danger</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-err-dim');
  });

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-transparent');
  });

  it('applies outline variant classes', () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('text-accent');
  });

  it('handles click', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled state prevents click', async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Disabled</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies xs size classes', () => {
    render(<Button size="xs">XS</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('px-2');
    expect(btn.className).toContain('rounded-sm');
  });

  it('applies sm size classes', () => {
    render(<Button size="sm">SM</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('px-2.5');
  });

  it('applies md size classes (default)', () => {
    render(<Button>MD</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('px-3.5');
    expect(btn.className).toContain('rounded-md');
  });

  it('applies lg size classes', () => {
    render(<Button size="lg">LG</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('px-4');
    expect(btn.className).toContain('rounded-lg');
  });

  it('merges custom className', () => {
    render(<Button className="my-extra">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('my-extra');
  });
});

/* ------------------------------------------------------------------ */
/*  Badge                                                              */
/* ------------------------------------------------------------------ */
describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies default gray variant', () => {
    render(<Badge>Gray</Badge>);
    expect(screen.getByText('Gray').className).toContain('text-text-md');
  });

  it('auto-detects blue variant for 登録済', () => {
    render(<Badge>登録済</Badge>);
    expect(screen.getByText('登録済').className).toContain('text-accent');
  });

  it('auto-detects green variant for 承認済', () => {
    render(<Badge>承認済</Badge>);
    expect(screen.getByText('承認済').className).toContain('text-ok');
  });

  it('auto-detects amber variant for レビュー待', () => {
    render(<Badge>レビュー待</Badge>);
    expect(screen.getByText('レビュー待').className).toContain('text-warn');
  });

  it('auto-detects red variant for 要修正', () => {
    render(<Badge>要修正</Badge>);
    expect(screen.getByText('要修正').className).toContain('text-err');
  });

  it('uses explicit variant over auto-detect', () => {
    render(<Badge variant="ai">Some text</Badge>);
    expect(screen.getByText('Some text').className).toContain('text-ai');
  });

  it('merges custom className', () => {
    render(<Badge className="extra-cls">Test</Badge>);
    expect(screen.getByText('Test')).toHaveClass('extra-cls');
  });
});

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */
describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Card className="p-4">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('p-4');
  });

  it('renders as default div tag', () => {
    const { container } = render(<Card>Inner</Card>);
    expect(container.firstChild!.nodeName).toBe('DIV');
  });

  it('renders with custom tag via as prop', () => {
    const { container } = render(<Card as="section">Inner</Card>);
    expect(container.firstChild!.nodeName).toBe('SECTION');
  });

  it('applies base styling classes', () => {
    const { container } = render(<Card>Styled</Card>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('bg-surface');
    expect(el.className).toContain('rounded-lg');
  });
});

/* ------------------------------------------------------------------ */
/*  SectionCard                                                        */
/* ------------------------------------------------------------------ */
describe('SectionCard', () => {
  it('renders title and children', () => {
    render(<SectionCard title="Section Title">Body text</SectionCard>);
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('renders action slot', () => {
    render(
      <SectionCard title="Title" action={<button>Action</button>}>
        Content
      </SectionCard>
    );
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('does not render action area when no action prop', () => {
    const { container } = render(<SectionCard title="T">C</SectionCard>);
    // The ml-auto wrapper div only appears when action is truthy
    const autoDiv = container.querySelector('.ml-auto');
    expect(autoDiv).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SectionCard title="T" className="mt-4">C</SectionCard>);
    // The outer Card gets p-4 + custom class
    expect(container.firstChild).toHaveClass('mt-4');
  });
});

/* ------------------------------------------------------------------ */
/*  Input                                                              */
/* ------------------------------------------------------------------ */
describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter value" />);
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  it('applies error class when error is true', () => {
    render(<Input error placeholder="Error input" />);
    const input = screen.getByPlaceholderText('Error input');
    expect(input.className).toContain('border-err');
  });

  it('does not apply error class when error is false', () => {
    render(<Input placeholder="Normal" />);
    const input = screen.getByPlaceholderText('Normal');
    expect(input.className).not.toContain('border-err');
  });

  it('passes through native input props', async () => {
    const onChange = vi.fn();
    render(<Input placeholder="Type" onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText('Type'), 'abc');
    expect(onChange).toHaveBeenCalled();
  });

  it('merges custom className', () => {
    render(<Input className="w-48" placeholder="Test" />);
    expect(screen.getByPlaceholderText('Test')).toHaveClass('w-48');
  });
});

/* ------------------------------------------------------------------ */
/*  Select                                                             */
/* ------------------------------------------------------------------ */
describe('Select', () => {
  it('renders with options', () => {
    render(
      <Select>
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('passes through native select props', () => {
    const onChange = vi.fn();
    render(
      <Select onChange={onChange} value="b">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('merges custom className', () => {
    render(<Select className="w-full"><option>X</option></Select>);
    expect(screen.getByRole('combobox')).toHaveClass('w-full');
  });
});

/* ------------------------------------------------------------------ */
/*  Textarea                                                           */
/* ------------------------------------------------------------------ */
describe('Textarea', () => {
  it('renders with placeholder', () => {
    render(<Textarea placeholder="Write something..." />);
    expect(screen.getByPlaceholderText('Write something...')).toBeInTheDocument();
  });

  it('renders as a textarea element', () => {
    render(<Textarea placeholder="TA" />);
    const el = screen.getByPlaceholderText('TA');
    expect(el.tagName).toBe('TEXTAREA');
  });

  it('merges custom className', () => {
    render(<Textarea className="h-40" placeholder="Tall" />);
    expect(screen.getByPlaceholderText('Tall')).toHaveClass('h-40');
  });
});

/* ------------------------------------------------------------------ */
/*  Checkbox                                                           */
/* ------------------------------------------------------------------ */
describe('Checkbox', () => {
  it('renders as a checkbox', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('handles change', async () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('is unchecked by default', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('respects checked prop', () => {
    render(<Checkbox checked readOnly />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});

/* ------------------------------------------------------------------ */
/*  UnitInput                                                          */
/* ------------------------------------------------------------------ */
describe('UnitInput', () => {
  it('renders with unit label', () => {
    render(<UnitInput unit="MPa" />);
    expect(screen.getByText('MPa')).toBeInTheDocument();
  });

  it('renders a number input', () => {
    const { container } = render(<UnitInput unit="GPa" />);
    const input = container.querySelector('input[type="number"]');
    expect(input).toBeInTheDocument();
  });

  it('passes inputProps to the input element', () => {
    const { container } = render(
      <UnitInput unit="HV" inputProps={{ placeholder: 'Value', min: 0 }} />
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toHaveAttribute('placeholder', 'Value');
    expect(input).toHaveAttribute('min', '0');
  });

  it('merges custom className on wrapper', () => {
    const { container } = render(<UnitInput unit="kg" className="w-40" />);
    expect(container.firstChild).toHaveClass('w-40');
  });
});

/* ------------------------------------------------------------------ */
/*  FormGroup                                                          */
/* ------------------------------------------------------------------ */
describe('FormGroup', () => {
  it('renders label', () => {
    render(<FormGroup label="Material Name"><Input /></FormGroup>);
    expect(screen.getByText('Material Name')).toBeInTheDocument();
  });

  it('shows required asterisk', () => {
    render(<FormGroup label="Name" required><Input /></FormGroup>);
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveClass('text-err');
  });

  it('does not show asterisk when not required', () => {
    const { container } = render(<FormGroup label="Name"><Input /></FormGroup>);
    expect(container.querySelector('.text-err')).not.toBeInTheDocument();
  });

  it('shows hint text', () => {
    render(<FormGroup label="X" hint="This is a hint"><Input /></FormGroup>);
    expect(screen.getByText('This is a hint')).toBeInTheDocument();
  });

  it('shows error and hides hint when error is present', () => {
    render(<FormGroup label="X" hint="Hint" error="Required field"><Input /></FormGroup>);
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.queryByText('Hint')).not.toBeInTheDocument();
  });

  it('renders children', () => {
    render(<FormGroup label="Lab"><span data-testid="child">Inner</span></FormGroup>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders without label', () => {
    const { container } = render(<FormGroup><Input placeholder="no label" /></FormGroup>);
    expect(container.querySelector('label')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('no label')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  ProgressBar                                                        */
/* ------------------------------------------------------------------ */
describe('ProgressBar', () => {
  const getInnerBar = (container: HTMLElement) =>
    container.querySelector('.h-full.rounded-full') as HTMLElement;

  it('renders with value percentage', () => {
    const { container } = render(<ProgressBar value={75} />);
    const inner = getInnerBar(container);
    expect(inner).toBeInTheDocument();
    expect(inner.style.width).toBe('75%');
  });

  it('renders 0% width for value 0', () => {
    const { container } = render(<ProgressBar value={0} />);
    const inner = getInnerBar(container);
    expect(inner.style.width).toBe('0%');
  });

  it('renders 100% width for value 100', () => {
    const { container } = render(<ProgressBar value={100} />);
    const inner = getInnerBar(container);
    expect(inner.style.width).toBe('100%');
  });

  it('applies custom color', () => {
    const { container } = render(<ProgressBar value={50} color="red" />);
    const inner = getInnerBar(container);
    expect(inner.style.background).toBe('red');
  });

  it('merges custom className on outer bar', () => {
    const { container } = render(<ProgressBar value={50} className="w-64" />);
    expect(container.firstChild).toHaveClass('w-64');
  });
});

/* ------------------------------------------------------------------ */
/*  Typing                                                             */
/* ------------------------------------------------------------------ */
describe('Typing', () => {
  it('renders 3 dots', () => {
    const { container } = render(<Typing />);
    const dots = container.querySelectorAll('span.rounded-full');
    expect(dots.length).toBe(3);
  });

  it('dots have animation styles', () => {
    const { container } = render(<Typing />);
    const dots = container.querySelectorAll('span.rounded-full');
    dots.forEach((dot) => {
      expect((dot as HTMLElement).style.animation).toBeTruthy();
    });
  });
});

/* ------------------------------------------------------------------ */
/*  Kbd                                                                */
/* ------------------------------------------------------------------ */
describe('Kbd', () => {
  it('renders children', () => {
    render(<Kbd>Ctrl+K</Kbd>);
    expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
  });

  it('renders as a kbd element', () => {
    render(<Kbd>Esc</Kbd>);
    expect(screen.getByText('Esc').tagName).toBe('KBD');
  });

  it('has expected styling classes', () => {
    render(<Kbd>Enter</Kbd>);
    const el = screen.getByText('Enter');
    expect(el.className).toContain('font-mono');
    expect(el.className).toContain('rounded');
  });
});
