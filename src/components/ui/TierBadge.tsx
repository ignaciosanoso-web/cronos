import type { Tier } from '@prisma/client'

const TIER_LABELS: Record<Tier, string> = {
  MITICO: 'Mítico',
  EXCEPCIONAL: 'Excepcional',
  RARO: 'Raro',
  COMUN: 'Común',
}

const TIER_CLASSES: Record<Tier, string> = {
  MITICO: 'tier tier-mitico',
  EXCEPCIONAL: 'tier tier-excepcional',
  RARO: 'tier tier-raro',
  COMUN: 'tier tier-comun',
}

interface TierBadgeProps {
  tier: Tier
  className?: string
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  return <span className={`${TIER_CLASSES[tier]} ${className}`}>{TIER_LABELS[tier]}</span>
}
