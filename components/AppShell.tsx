'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { AuthProvider, useAuth } from '@/lib/auth'

const SidebarContext = createContext<{ collapsed: boolean; setCollapsed: (collapsed: boolean) => void }>({
  collapsed: false,
  setCollapsed: () => {},
})

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login')
    }
  }, [isAuthenticated, router, pathname])

  // Don't show shell on login page
  if (pathname === '/login') {
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarContext.Provider value={{ collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed }}>
      <div className="flex min-h-screen">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-primary text-white rounded-lg shadow-lg"
          aria-label="فتح القائمة"
        >
          <Menu size={24} />
        </button>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className={`flex-1 mr-0 transition-all duration-300 min-w-0 ${sidebarCollapsed ? 'lg:mr-20' : 'lg:mr-64'}`}>
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShellContent>{children}</AppShellContent>
    </AuthProvider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
