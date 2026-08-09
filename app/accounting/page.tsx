'use client'

import { useMemo, useState } from 'react'
import {
  Banknote,
  BookOpenCheck,
  Building2,
  Calculator,
  CircleDollarSign,
  FileSpreadsheet,
  HandCoins,
  Landmark,
  Search,
  TrendingDown,
  WalletCards,
} from 'lucide-react'
import { matchesArabic } from '@/lib/arabic-normalize'

type EntryType = 'revenue' | 'expense'

interface AccountingEntry {
  type: EntryType
  chapter: number
  item?: number
  title: string
  parent?: string
  note?: string
}

const revenues: AccountingEntry[] = [
  { type: 'revenue', chapter: 1, item: 1, title: 'الوفر المدور من العام الماضي' },
  { type: 'revenue', chapter: 1, item: 2, title: 'بدلات الإيجار وريع الاستثمار' },
  { type: 'revenue', chapter: 1, item: 3, title: 'مساهمة الوزارة في البدل النقدي للدينيين في المساجد' },
  { type: 'revenue', chapter: 1, item: 4, title: 'الهبات وبدلات التنازل عن حق الاستئجار ورسوم التحصيل' },
  { type: 'revenue', chapter: 1, item: 5, title: 'إيرادات مستحقة من الأعوام السابقة' },
  { type: 'revenue', chapter: 1, item: 6, title: 'إيرادات متنوعة' },
]

const expenses: AccountingEntry[] = [
  { type: 'expense', chapter: 1, item: 1, title: 'أجور العاملين الدائمين', parent: 'الرواتب والأجور والتعويضات' },
  { type: 'expense', chapter: 1, item: 2, title: 'أجور العاملين المؤقتين والمتعاقدين', parent: 'الرواتب والأجور والتعويضات' },
  { type: 'expense', chapter: 1, item: 3, title: 'البدل النقدي للدينيين في المساجد', parent: 'الرواتب والأجور والتعويضات' },
  { type: 'expense', chapter: 1, item: 4, title: 'تعويضات طبيعة العمل', parent: 'الرواتب والأجور والتعويضات' },
  { type: 'expense', chapter: 1, item: 5, title: 'تعويضات الأعمال الإضافية واللجان', parent: 'الرواتب والأجور والتعويضات' },
  { type: 'expense', chapter: 1, item: 6, title: 'التعويضات الأخرى', parent: 'الرواتب والأجور والتعويضات' },
  { type: 'expense', chapter: 1, item: 7, title: 'المكافآت', parent: 'الرواتب والأجور والتعويضات' },

  { type: 'expense', chapter: 2, item: 1, title: 'نفقات نقل وانتقال', parent: 'النفقات الإدارية العامة' },
  { type: 'expense', chapter: 2, item: 2, title: 'نفقات بريد وهاتف وكهرباء وماء', parent: 'النفقات الإدارية العامة' },
  { type: 'expense', chapter: 2, item: 3, title: 'محروقات - بنزين', parent: 'النفقات الإدارية العامة' },
  { type: 'expense', chapter: 2, item: 3, title: 'محروقات - مازوت', parent: 'النفقات الإدارية العامة' },
  { type: 'expense', chapter: 2, item: 4, title: 'لوازم الإدارة الثابتة', parent: 'النفقات الإدارية العامة' },
  { type: 'expense', chapter: 2, item: 5, title: 'الكساء العمالي', parent: 'النفقات الإدارية العامة' },
  { type: 'expense', chapter: 2, item: 6, title: 'قرطاسية ومطبوعات', parent: 'النفقات الإدارية العامة' },
  { type: 'expense', chapter: 2, item: 7, title: 'نفقات صيانة - آليات وسيارات', parent: 'النفقات الإدارية العامة' },
  { type: 'expense', chapter: 2, item: 7, title: 'نفقات صيانة متنوعة', parent: 'النفقات الإدارية العامة' },
  { type: 'expense', chapter: 2, item: 8, title: 'نفقات الدعاية والضيافة والمؤتمرات والمعارض', parent: 'النفقات الإدارية العامة' },
  { type: 'expense', chapter: 2, item: 9, title: 'نفقات متنوعة أخرى', parent: 'النفقات الإدارية العامة' },
  { type: 'expense', chapter: 2, item: 10, title: 'نفقات إدارية خاصة بالمساجد والعقارات الوقفية', parent: 'النفقات الإدارية العامة' },
  { type: 'expense', chapter: 2, item: 11, title: 'نفقات تدريب وتأهيل', parent: 'النفقات الإدارية العامة' },

  { type: 'expense', chapter: 3, item: 1, title: 'شراء وإنشاء عقارات', parent: 'النفقات الإنمائية والاستثمارية' },
  { type: 'expense', chapter: 3, item: 2, title: 'شراء آليات', parent: 'النفقات الإنمائية والاستثمارية' },
  { type: 'expense', chapter: 3, item: 3, title: 'تجهيز مشاريع وقفية متنوعة', parent: 'النفقات الإنمائية والاستثمارية' },

  { type: 'expense', chapter: 4, item: 1, title: 'المساهمة بموازنة مجلس الأوقاف المركزي', parent: 'المساهمات' },
  { type: 'expense', chapter: 4, item: 2, title: 'المساهمة بموازنة شعب الأوقاف', parent: 'المساهمات', note: 'شعبة 1، شعبة 2' },
  { type: 'expense', chapter: 4, item: 3, title: 'المساهمة بدور الأمان والمبرات والمراكز التابعة للوزارة', parent: 'المساهمات', note: 'دور أمان، مبرات، مراكز' },

  { type: 'expense', chapter: 5, item: 1, title: 'إعانات تميز', parent: 'الإعانات' },
  { type: 'expense', chapter: 5, item: 2, title: 'إعانات للعاملين وغير العاملين', parent: 'الإعانات' },
  { type: 'expense', chapter: 6, item: 1, title: 'منحة الشهر الإضافي للعاملين بالمديرية' },
]

const allEntries = [...revenues, ...expenses]

const chapterMeta = [
  { type: 'revenue' as const, chapter: 1, title: 'الإيرادات', icon: CircleDollarSign, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { type: 'expense' as const, chapter: 1, title: 'الرواتب والأجور والتعويضات', icon: WalletCards, tone: 'bg-blue-50 text-blue-700 border-blue-100' },
  { type: 'expense' as const, chapter: 2, title: 'النفقات الإدارية العامة', icon: FileSpreadsheet, tone: 'bg-amber-50 text-amber-700 border-amber-100' },
  { type: 'expense' as const, chapter: 3, title: 'النفقات الإنمائية والاستثمارية', icon: Building2, tone: 'bg-purple-50 text-purple-700 border-purple-100' },
  { type: 'expense' as const, chapter: 4, title: 'المساهمات', icon: HandCoins, tone: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  { type: 'expense' as const, chapter: 5, title: 'الإعانات', icon: Landmark, tone: 'bg-rose-50 text-rose-700 border-rose-100' },
  { type: 'expense' as const, chapter: 6, title: 'منحة الشهر الإضافي', icon: Banknote, tone: 'bg-lime-50 text-lime-700 border-lime-100' },
]

const typeLabels: Record<EntryType, string> = {
  revenue: 'إيراد',
  expense: 'نفقة',
}

export default function AccountingPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | EntryType>('all')
  const [chapterFilter, setChapterFilter] = useState('all')

  const filteredEntries = useMemo(() => {
    const trimmedQuery = query.trim()

    return allEntries.filter((entry) => {
      const matchesType = typeFilter === 'all' || entry.type === typeFilter
      const matchesChapter = chapterFilter === 'all' || `${entry.type}-${entry.chapter}` === chapterFilter
      const matchesQuery =
        !trimmedQuery ||
        matchesArabic(trimmedQuery, entry.title) ||
        (entry.parent && matchesArabic(trimmedQuery, entry.parent)) ||
        (entry.note && matchesArabic(trimmedQuery, entry.note))

      return matchesType && matchesChapter && matchesQuery
    })
  }, [chapterFilter, query, typeFilter])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-dark to-primary text-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">المحاسبة</h1>
            <p className="text-white/70 mt-1">مشروع موازنة مديرية الأوقاف للعام المالي 2026</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
            <Calculator size={24} className="text-gold-light" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CircleDollarSign size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">بنود الإيرادات</p>
                <p className="text-2xl font-bold text-gray-900">{revenues.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <TrendingDown size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">بنود النفقات</p>
                <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <BookOpenCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">أبواب الموازنة</p>
                <p className="text-2xl font-bold text-gray-900">{chapterMeta.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {chapterMeta.map((chapter) => {
              const Icon = chapter.icon
              const value = `${chapter.type}-${chapter.chapter}`
              const count = allEntries.filter((entry) => entry.type === chapter.type && entry.chapter === chapter.chapter).length
              const active = chapterFilter === value

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setChapterFilter(active ? 'all' : value)}
                  className={`w-full text-right bg-white border rounded-lg p-4 transition-colors ${
                    active ? 'border-primary shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg border flex items-center justify-center ${chapter.tone}`}>
                      <Icon size={19} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{chapter.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        باب {chapter.chapter} · {count} بند
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-primary">دليل بنود الموازنة</h2>
                  <p className="text-sm text-gray-500">{filteredEntries.length} بند ظاهر</p>
                </div>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {[
                    { value: 'all', label: 'الكل' },
                    { value: 'revenue', label: 'الإيرادات' },
                    { value: 'expense', label: 'النفقات' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTypeFilter(option.value as 'all' | EntryType)}
                      className={`px-4 py-2 text-sm font-semibold ${
                        typeFilter === option.value
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="relative block">
                <Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="بحث باسم البند أو الباب..."
                  className="w-full rounded-lg border border-gray-200 py-2.5 pr-10 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600">النوع</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600">الباب</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600">البند</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600">العنوان</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600">التفصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry, index) => (
                    <tr key={`${entry.type}-${entry.chapter}-${entry.item}-${entry.title}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex min-w-16 justify-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          entry.type === 'revenue'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {typeLabels[entry.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{entry.chapter}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entry.item ?? '-'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{entry.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {entry.note || entry.parent || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEntries.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-400">لا توجد بنود مطابقة</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
