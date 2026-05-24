import type { ReactNode } from 'react'

interface LabelCapsProps {
  children: ReactNode
  className?: string
  as?: 'span' | 'div' | 'p'
}

export function LabelCaps({ children, className = '', as: Tag = 'span' }: LabelCapsProps) {
  return <Tag className={`label-caps ${className}`}>{children}</Tag>
}
