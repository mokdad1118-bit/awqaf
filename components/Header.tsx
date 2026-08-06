'use client'

import { useState, useCallback, memo, useEffect } from 'react'
import { Search, Bell, Plus, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useDebounce } from '@/lib/useDebounce'

interface HeaderProps {
  onSearch?: (query: string) => void
}

function Header({ onSearch }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearchValue = useDebounce(searchValue, 300)

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }, [])

  useEffect(() => {
    onSearch?.(debouncedSearchValue)
  }, [debouncedSearchValue, onSearch])

  return (
    <header className="bg-white border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearch}
              placeholder="ابحث باسم المسجد أو العامل..."
              className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mr-6">
          <Link
            href="/workers/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <UserPlus size={16} />
            <span>إضافة عامل</span>
          </Link>
          <Link
            href="/mosques/new"
            className="flex items-center gap-2 px-4 py-2 bg-gold text-primary-dark rounded-lg text-sm font-medium hover:bg-gold-light transition-colors"
          >
            <Plus size={16} />
            <span>إضافة مسجد</span>
          </Link>
          <button className="relative p-2 text-gray-500 hover:text-primary transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default memo(Header)
