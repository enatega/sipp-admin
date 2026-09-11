'use client'

import { SidebarMenuItem } from '@/components/ui/sidebar'
import { type SidebarMenu } from '@/config/sidebar'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

type MenuItemProps = {
  item: SidebarMenu
  isActive: boolean
}

const MenuItem = ({ isActive, item }: MenuItemProps) => {
  const Icon = item.icon
  const t = useTranslations()
  const label = t.has(item.translationKey) ? t(item.translationKey) : item.name

  return (
    <SidebarMenuItem>
      <Link
        href={item.path}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
          isActive ? 'bg-primary text-white' : 'hover:bg-gray-200/50 hover:text-primary'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        {Icon ? <Icon className="h-[18px] w-[18px]" aria-hidden /> : null}
        <span>{label}</span>
      </Link>
    </SidebarMenuItem>
  )
}

export default MenuItem
