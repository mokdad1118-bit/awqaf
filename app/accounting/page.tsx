'use client'

import { Calculator } from 'lucide-react'

export default function AccountingPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto mt-24 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Calculator size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">المحاسبة</h1>
          <p className="text-gray-500">سيتم تطوير هذا القسم فيما بعد</p>
        </div>
    </div>
  )
}
