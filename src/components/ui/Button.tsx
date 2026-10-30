// 공용 버튼 컴포넌트 (FEAT-003)
// 모든 버튼은 터치 친화적으로 최소 높이 44px 이상을 보장합니다.

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
  primary: 'bg-brand text-white active:bg-brand-dark disabled:opacity-50',
  secondary:
    'bg-slate-100 text-slate-800 active:bg-slate-200 disabled:opacity-50',
  ghost: 'bg-transparent text-brand active:bg-slate-100 disabled:opacity-50',
  danger: 'bg-red-50 text-red-600 active:bg-red-100 disabled:opacity-50',
}

const sizeClasses: Record<ButtonSize, string> = {
  // 최소 터치 영역 44px 보장
  md: 'min-h-[44px] px-4 text-sm',
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
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
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
