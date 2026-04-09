import React from 'react';
import { Icon } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ai' | 'vec' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

interface BadgeProps {
  variant?: string;
  children: React.ReactNode;
  className?: string;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  [key: string]: any;
}

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  children: React.ReactNode;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

interface UnitInputProps {
  unit: string;
  className?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

interface FormGroupProps {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
}

interface TypingProps {
  color?: string;
}

interface KbdProps {
  children: React.ReactNode;
}

export const Button = ({ variant = 'default', size = 'md', children, className = '', ...props }: ButtonProps) => {
  const base = 'inline-flex items-center gap-1.5 font-ui cursor-pointer transition-all duration-150 border select-none whitespace-nowrap focus-visible:ring-2 disabled:opacity-40 disabled:pointer-events-none';
  const sizes = {
    xs: 'px-2 py-0.5 text-[12px] rounded-sm',
    sm: 'px-2.5 py-1 text-[12px] rounded-sm',
    md: 'px-3.5 py-[7px] text-[13px] rounded-md',
    lg: 'px-4 py-2 text-sm rounded-lg',
  };
  const variants = {
    default:  'bg-surface text-text-hi border-border hover:bg-hover hover:border-[var(--border-strong)]',
    primary:  'bg-accent text-white border-accent hover:brightness-110',
    ai:       'bg-ai text-white border-ai hover:brightness-110',
    vec:      'bg-vec text-[var(--bg-base)] border-vec font-semibold hover:brightness-110',
    danger:   'bg-err-dim text-err border-[rgba(139,26,26,.2)] hover:bg-err hover:text-white',
    ghost:    'bg-transparent text-text-md border-transparent hover:bg-hover',
    outline:  'bg-transparent text-accent border-border hover:bg-accent-dim',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge = ({ variant = 'gray', children, className = '' }: BadgeProps) => {
  const variants = {
    gray:   'bg-[var(--tag-surface)] text-text-md',
    blue:   'bg-accent-dim text-accent',
    green:  'bg-[var(--ok-dim)] text-ok',
    amber:  'bg-[var(--warn-dim)] text-warn',
    red:    'bg-err-dim text-err',
    ai:     'bg-ai-dim text-ai',
    vec:    'bg-vec-dim text-vec',
  };
  const STATUS_VARIANT: Record<string, string> = { '登録済':'blue','承認済':'green','レビュー待':'amber','要修正':'red' };
  const v = (typeof children === 'string' && STATUS_VARIANT[children]) || variant;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium whitespace-nowrap ${(variants as Record<string, string>)[v]} ${className}`}>
      {children}
    </span>
  );
};

export const Card = ({ children, className = '', as: Tag = 'div', ...props }: CardProps) => (
  <Tag className={`bg-surface border border-[var(--border-faint)] rounded-lg transition-colors duration-300 ${className}`} style={{ boxShadow: 'var(--shadow-xs)' }} {...props}>
    {children}
  </Tag>
);

export const SectionCard = ({ title, children, className = '', action }: SectionCardProps) => (
  <Card className={`p-4 ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[12px] font-bold text-text-lo tracking-[.05em] uppercase">{title}</span>
      {action && <div className="ml-auto">{action}</div>}
    </div>
    {children}
  </Card>
);

export const Input = ({ className = '', error, ...props }: InputProps) => (
  <input
    className={`w-full px-3 py-2 bg-raised border rounded-md text-[13px] font-ui text-text-hi transition-all duration-150
      placeholder:text-text-lo
      focus:outline-none focus:border-[var(--accent-mid)] focus:bg-surface focus:ring-2 focus:ring-[var(--accent-glow)]
      ${error ? 'border-err ring-2 ring-[var(--err-dim)]' : 'border-[var(--border-default)]'}
      ${className}`}
    {...props}
  />
);

export const Select = ({ className = '', children, ...props }: SelectProps) => (
  <select
    className={`px-2.5 py-2 bg-raised border border-[var(--border-default)] rounded-md text-[13px] font-ui text-text-hi cursor-pointer
      focus:outline-none focus:border-[var(--accent-mid)]
      ${className}`}
    {...props}
  >
    {children}
  </select>
);

export const Textarea = ({ className = '', ...props }: TextareaProps) => (
  <textarea
    className={`w-full px-3 py-2 bg-raised border border-[var(--border-default)] rounded-md text-[13px] font-ui text-text-hi resize-y min-h-[68px] leading-relaxed
      focus:outline-none focus:border-[var(--accent-mid)] focus:bg-surface focus:ring-2 focus:ring-[var(--accent-glow)]
      ${className}`}
    {...props}
  />
);

export const Checkbox = ({ ...props }) => (
  <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer accent-accent" {...props} />
);

export const UnitInput = ({ unit, className = '', inputProps = {} }: UnitInputProps) => (
  <div className={`flex border border-[var(--border-default)] rounded-md overflow-hidden bg-raised focus-within:border-[var(--accent-mid)] focus-within:ring-2 focus-within:ring-[var(--accent-glow)] ${className}`}>
    <input type="number" className="flex-1 px-3 py-2 bg-transparent text-[13px] font-ui text-text-hi outline-none" {...inputProps} />
    <span className="px-2.5 py-2 bg-sunken text-[12px] text-text-lo border-l border-[var(--border-default)] flex-shrink-0 flex items-center">{unit}</span>
  </div>
);

export const Divider = ({ className = '' }) => (
  <div className={`h-px bg-[var(--border-faint)] my-3 ${className}`} />
);

export const FormGroup = ({ label, required, hint, error, children, className = '' }: FormGroupProps) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && (
      <label className="text-[12px] font-semibold text-text-md">
        {label}{required && <span className="text-err ml-0.5">*</span>}
      </label>
    )}
    {children}
    {hint && !error && <p className="text-[12px] text-text-lo">{hint}</p>}
    {error && <p className="text-[12px] text-err">{error}</p>}
  </div>
);

export const Typing = ({ color = 'var(--ai-col)' }: TypingProps) => (
  <div className="flex items-center gap-1 py-0.5">
    {[0,1,2].map(i => (
      <span key={i} className="w-1 h-1 rounded-full inline-block" style={{ background: color, opacity: .4, animation: `dot 1.3s ease-in-out ${i * .2}s infinite` }} />
    ))}
    <style>{`@keyframes dot{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}`}</style>
  </div>
);

export const ProgressBar = ({ value, color = 'var(--accent)', className = '' }: ProgressBarProps) => (
  <div className={`h-1.5 bg-raised rounded-full overflow-hidden flex-shrink-0 ${className}`}>
    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
  </div>
);

export const Kbd = ({ children }: KbdProps) => (
  <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-[var(--border-default)] bg-raised text-[11px] font-mono text-text-md">
    {children}
  </kbd>
);
