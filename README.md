# نظام إدارة المساجد والعاملين
## Mosque Management System - Syria

### 🏗️ التقنيات المستخدمة
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM**
- **PostgreSQL**
- **Recharts** (Charts)

### 📋 متطلبات التشغيل
1. Node.js 18+
2. PostgreSQL 14+

### 🚀 خطوات التشغيل

```bash
# 1. تثبيت الحزم
npm install

# 2. إعداد متغيرات البيئة
# أنسخ ملف .env.example إلى .env وعدل DATABASE_URL
cp .env.example .env

# 3. توليد Prisma Client
npx prisma generate

# 4. تشغيل Migration
npx prisma migrate dev --name init

# 5. تعبئة البيانات الأولية
npx prisma db seed

# 6. تشغيل السيرفر
npm run dev
```

### 🗄️ متغيرات البيئة (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/mosque_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 📁 هيكل المشروع
```
mosque-management/
├── app/                    # Next.js App Router
│   ├── page.tsx            # الصفحة الرئيسية (بطاقات المساجد)
│   ├── layout.tsx          # التخطيط العام
│   ├── mosques/
│   │   ├── [id]/page.tsx   # تفاصيل المسجد
│   │   └── new/page.tsx    # إضافة مسجد
│   ├── workers/
│   │   ├── page.tsx        # قائمة العاملين
│   │   └── new/page.tsx    # إضافة عامل
│   ├── statistics/         # الإحصائيات
│   ├── settings/           # الإعدادات
│   └── api/                # API Routes
├── components/             # المكونات
├── prisma/
│   ├── schema.prisma       # مخطط قاعدة البيانات
│   └── seed.ts             # البيانات الأولية
├── lib/                    # المكتبات المساعدة
├── types/                  # أنواع TypeScript
└── public/                 # الملفات الثابتة
```

### ✨ الميزات
- ✅ بطاقات تفاعلية للمساجد
- ✅ صفحة تفاصيل كاملة لكل مسجد
- ✅ جدول العاملين المرتبطين بالمسجد
- ✅ إضافة/تعديل/حذف المساجد والعاملين
- ✅ بحث وتصفية متقدم
- ✅ إحصائيات ورسوم بيانية
- ✅ قائمة جانبية قابلة للطي
- ✅ لوغو الجمهورية العربية السورية
- ✅ تصميم متجاوب (Responsive)
- ✅ RTL (من اليمين لليسار)

### 📝 ملاحظة
ضع صورة شعار الجمهورية العربية السورية في `public/syria-logo.png`
