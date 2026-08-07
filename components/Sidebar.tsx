'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Building,
  Users,
  LayoutDashboard,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  BarChart3,
  LogOut,
  Briefcase,
  Calculator,
  BookOpen,
  DollarSign
} from 'lucide-react'
import { useAuth } from '@/lib/auth'

const adminDevItems = [
  { href: '/', label: 'الرئيسية', icon: LayoutDashboard, permission: 'التنمية الإدارية' },
  { href: '/mosques', label: 'المساجد', icon: Building, permission: 'التنمية الإدارية' },
  { href: '/workers', label: 'العاملين', icon: Users, permission: 'العاملين' },
  { href: '/statistics', label: 'الإحصائيات', icon: BarChart3, permission: 'التنمية الإدارية' },
]

const educationalCirclesItems = [
  { href: '/educational-circles', label: 'الحلقات التربوية', icon: BookOpen, permission: 'الحلقات التربوية' },
  { href: '/rewards', label: 'المكافآت', icon: DollarSign, permission: 'الحلقات التربوية' },
]

const standaloneItems = [
  { href: '/accounting', label: 'المحاسبة', icon: Calculator, permission: 'المحاسبة' },
  { href: '/settings', label: 'الإعدادات', icon: Settings, adminOnly: true },
]

function isItemActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function isAdminDevPath(pathname: string) {
  return adminDevItems.some((item) => isItemActive(pathname, item.href))
}

function isEducationalCirclesPath(pathname: string) {
  return educationalCirclesItems.some((item) => isItemActive(pathname, item.href))
}

export default memo(function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (open: boolean) => void }) {
  const [collapsed, setCollapsed] = useState(false)
  const [adminDevOpen, setAdminDevOpen] = useState(false)
  const [educationalCirclesOpen, setEducationalCirclesOpen] = useState(false)
  const pathname = usePathname()
  const { logout, hasPermission, isAdmin } = useAuth()

  const isAdminDevActive = isAdminDevPath(pathname)
  const showAdminDevSubmenu = adminDevOpen && !collapsed

  const isEducationalCirclesActive = isEducationalCirclesPath(pathname)
  const showEducationalCirclesSubmenu = educationalCirclesOpen && !collapsed

  const toggleAdminDev = useCallback(() => {
    setAdminDevOpen((prev) => !prev)
  }, [])

  const toggleEducationalCircles = useCallback(() => {
    setEducationalCirclesOpen((prev) => !prev)
  }, [])

  const handleLogout = () => {
    logout()
  }

  // Filter items based on permissions
  const filteredAdminDevItems = adminDevItems.filter(item => 
    isAdmin || hasPermission(item.permission || '')
  )

  const filteredEducationalCirclesItems = educationalCirclesItems.filter(item => 
    isAdmin || hasPermission(item.permission || '')
  )

  const filteredStandaloneItems = standaloneItems.filter(item => 
    isAdmin || (item.adminOnly ? isAdmin : hasPermission(item.permission || ''))
  )

  return (
    <aside
      className={cn(
        "fixed right-0 top-0 h-screen bg-primary/90 backdrop-blur-sm border-l border-primary/95 text-primary-dark transition-all duration-300 z-50 flex flex-col",
        collapsed ? "w-20" : "w-64",
        // On mobile: hidden by default (translate-x-full), shown when open (translate-x-0)
        // On desktop (lg): always visible (translate-x-0)
        mobileMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src="/شعار الدولة .jpeg"
              alt="شعار الجمهورية العربية السورية"
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-gold-light leading-tight">
                الجمهورية العربية السورية
              </h1>
              <p className="text-[10px] text-white/70 mt-0.5">
                مديرية أوقاف السويداء
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-3 top-24 w-6 h-6 bg-gold text-primary-dark rounded-full flex items-center justify-center hover:bg-gold-light transition-colors lg:flex hidden"
        aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
      >
        {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div>
          <button
            type="button"
            onClick={toggleAdminDev}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 w-full",
              isAdminDevActive
                ? "bg-primary-light/50 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Briefcase size={20} className="flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="text-sm font-medium whitespace-nowrap flex-1 text-right">
                  التنمية الإدارية
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "flex-shrink-0 transition-transform duration-200",
                    adminDevOpen ? "rotate-180" : "rotate-0"
                  )}
                />
              </>
            )}
          </button>

          {showAdminDevSubmenu && (
            <div className="mt-1 mr-3 space-y-1 border-r border-white/10 pr-2">
              {filteredAdminDevItems.map((item) => {
                const Icon = item.icon
                const isActive = isItemActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-primary-light text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="mr-auto w-1.5 h-1.5 bg-gold rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={toggleEducationalCircles}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 w-full",
              isEducationalCirclesActive
                ? "bg-primary-light/50 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <BookOpen size={20} className="flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="text-sm font-medium whitespace-nowrap flex-1 text-right">
                  الحلقات التربوية
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "flex-shrink-0 transition-transform duration-200",
                    educationalCirclesOpen ? "rotate-180" : "rotate-0"
                  )}
                />
              </>
            )}
          </button>

          {showEducationalCirclesSubmenu && (
            <div className="mt-1 mr-3 space-y-1 border-r border-white/10 pr-2">
              {filteredEducationalCirclesItems.map((item) => {
                const Icon = item.icon
                const isActive = isItemActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-primary-light text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="mr-auto w-1.5 h-1.5 bg-gold rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {filteredStandaloneItems.map((item) => {
          const Icon = item.icon
          const isActive = isItemActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200",
                isActive
                  ? "bg-primary-light text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="mr-auto w-1.5 h-1.5 bg-gold rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => {
            handleLogout()
            setMobileMenuOpen(false)
          }}
          className="flex items-center gap-3 text-white/70 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  )
})
