// 공용 버튼 컴포넌트
// 모든 버튼은 최소 높이 44px 이상을 보장합니다.

import { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white active:bg-brand-dark disabled:bg-ink-mute',
  secondary: 'border border-line bg-white text-ink active:bg-paper disabled:text-ink-mute',
  ghost: 'bg-transparent text-ink-soft underline-offset-4 active:text-ink disabled:opacity-50',
  danger: 'border border-line bg-white text-kor active:bg-kor-tint disabled:opacity-50',
}

const sizeClasses: Record<ButtonSize, string> = {
  md: 'min-h-[44px] px-4 text-[15px]',
  lg: 'min-h-[52px] px-5 text-base',
}

function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded font-semibold transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
