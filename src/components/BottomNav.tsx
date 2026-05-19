'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/',        label: 'Home',    icon: '🏠' },
  { href: '/browse',  label: 'Browse',  icon: '📚' },
  { href: '/add',     label: 'Add',     icon: '✚' },
  { href: '/review',  label: 'Review',  icon: '🔁' },
  { href: '/search',  label: 'Search',  icon: '🔍' },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex z-40">
      {tabs.map(tab => {
        const active = tab.href === '/' ? path === '/' : path.startsWith(tab.href)
        return (
          <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center py-2 gap-0.5">
            <span className="text-lg">{tab.icon}</span>
            <span className={`text-[9px] tracking-widest ${active ? 'text-accent' : 'text-subtle'}`}>
              {tab.label.toUpperCase()}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
