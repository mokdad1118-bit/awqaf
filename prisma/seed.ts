import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.worker.deleteMany()
  await prisma.mosque.deleteMany()

  const mosquesData = [
    { name: "عمر بن الخطاب", city: "المقوس", location: "وسط البلد", category: "أ", type: "عام", area: 324, status: "جيدة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "سدة وقبو", imam: "محمد عقلة العقلة", khatib: "محمد عقلة العقلة", muezzin: "محمد عقلة العقلة", khadim: "محمد عقلة العقلة" },
    { name: "علي بن أبي طالب", city: "رجم الزيتون", location: "وسط البلد", category: "أ", type: "عام", area: 300, status: "ممتازة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "سدة وقبو", imam: "عبد الرحمن محمد النمر", khatib: "عبد الرحمن محمد النمر", muezzin: "عبد الرحمن محمد النمر", khadim: "عبد الرحمن محمد النمر" },
    { name: "المهاجرين", city: "الشقراوية", location: "وسط البلد", category: "أ", type: "عام", area: 156, status: "جيدة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "لا يوجد", imam: "هنيدي درويش الفهيد", khatib: "محمد علي راشد الحريري", muezzin: "هنيدي درويش الفهيد", khadim: "علي ثامر الحتيتي" },
    { name: "سعد بن أبي وقاص", city: "المنصورة", location: "وسط البلد", category: "ب", type: "عام", area: 250, status: "جيدة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "لا يوجد", imam: "خالد سلامة الغثيان", khatib: "أنور عوض عودة", muezzin: "خالد سلامة الغثيان", khadim: "خالد سلامة الغثيان" },
    { name: "النور", city: "الحروبي", location: "أول البلد", category: "أ", type: "عام", area: 144, status: "جيدة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "سدة", imam: "محمد عليان أبو ثليث", khatib: "رضوان حسن الحريري", muezzin: "محمد عليان أبو ثليث", khadim: "خالد عليان أبو ثليث" },
    { name: "خالد بن الوليد", city: "المزرعة", location: "شرقي البلد", category: "ج", type: "عام", area: 120, status: "متوسطة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "لا يوجد", imam: "هايل عنيزي الحمود", khatib: "ـ", muezzin: "هايل عنيزي الحمود", khadim: "هايل عنيزي الحمود" },
    { name: "أنس بن مالك", city: "المزرعة", location: "وسط البلد", category: "أ", type: "عام", area: 120, status: "متوسطة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "لا يوجد", imam: "نصر هلال النادر", khatib: "", muezzin: "عيسى نصر النادر", khadim: "عيسى نصر النادر" },
    { name: "بلال الحبشي", city: "المزرعة", location: "عالطريق العام", category: "أ", type: "عام", area: 150, status: "جيدة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "لا يوجد", imam: "نورس خلف السالم الفضيلي", khatib: "محمود الكسور", muezzin: "نورس خلف السالم الفضيلي", khadim: "محمد خلف نورس الفضيلي" },
    { name: "أبو بكر الصديق", city: "سليم", location: "وسط البلد", category: "ج", type: "عام", area: 144, status: "ضعيفة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "قبو", imam: "وادي ذياب الوادي", khatib: "جبران أكرم سلام", muezzin: "وادي ذياب الوادي", khadim: "وادي ذياب الوادي" },
    { name: "أبو بكر الصديق", city: "ريمة اللحف", location: "وسط البلد", category: "ج", type: "عام", area: 250, status: "جيدة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "لا يوجد", imam: "غالب شحادة الحمود", khatib: "غالب شحادة الحمود", muezzin: "حسين عليان الحمود", khadim: "حسين عليان الحمود" },
    { name: "حسان بن ثابت", city: "بريكة", location: "وسط البلد", category: "ج", type: "عام", area: 150, status: "متوسطة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "لا يوجد", imam: "طالب عوض الشهيب", khatib: "طالب عوض الشهيب", muezzin: "ركان صياح الشهيب", khadim: "ركان صياح الشهيب" },
    { name: "عمر بن الخطاب", city: "شهبا", location: "غرب البلد", category: "أ", type: "عام", area: null, status: "جيدة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "لا يوجد", imam: "سليمان غوطان الهوارين", khatib: "سليمان غوطان الهوارين", muezzin: "أحمد خالد لدح", khadim: "أحمد خالد لدح" },
    { name: "المسجد الكبير", city: "السوق", location: "جانب قيادة الشرطة", category: "أ", type: "مركزي", area: 450, status: "ممتازة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "قبو", imam: "فواز محمد المحمد", khatib: "فواز محمد المحمد", muezzin: "", khadim: "" },
    { name: "أبو عبيدة بن الجراح", city: "البستان", location: "وسط البلد", category: "ب", type: "عام", area: 250, status: "متوسطة", isActive: true, isDestroyed: "مهدم جزئياً", state: "بانتظار الترميم", friday: true, attachments: "سدة", imam: "محمد شاتي البلعاس", khatib: "محمد شاتي البلعاس", muezzin: "محمد شاتي البلعاس", khadim: "محمد شاتي البلعاس" },
    { name: "مصعب بن عمير", city: "عرى", location: "شرقي البلد", category: "ب", type: "عام", area: 400, status: "متوسطة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "لا يوجد", imam: "حمد عقلة السعيفان", khatib: "ـ", muezzin: "حمد عقلة السعيفان", khadim: "حمد عقلة السعيفان" },
    { name: "أبو بكر الصديق", city: "عرى", location: "وسط البلد", category: "أ", type: "عام", area: 225, status: "ممتازة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "لا يوجد", imam: "أحمد فرحان النابلسي", khatib: "معتصم زهير الغوثاني", muezzin: "أحمد فرحان النابلسي", khadim: "أحمد فرحان النابلسي" },
    { name: "أسامة بن زيد", city: "عرى", location: "غربي البلد", category: "ب", type: "عام", area: 225, status: "ممتازة", isActive: false, isDestroyed: "لا يوجد", state: "جاهز", friday: false, attachments: "سدة", imam: "فلاح عواد الصالح", khatib: "ـ", muezzin: "فلاح عواد الصالح", khadim: "فلاح عواد الصالح" },
    { name: "أم القرى", city: "الأصلحة", location: "وسط البلد", category: "ب", type: "عام", area: 200, status: "متوسطة", isActive: true, isDestroyed: "لا يوجد", state: "جاهز", friday: true, attachments: "لا يوجد", imam: "خلف محمود الهديب", khatib: "سامي ياسين الرفاعي", muezzin: "خلف محمود الهديب", khadim: "فارس خلف الهديب" },
    { name: "خالد بن الوليد 1", city: "الجبيب", location: "وسط البلد", category: "ب", type: "عام", area: 167, status: "متوسطة", isActive: true, isDestroyed: "لا يوجد", state: "جاهز", friday: true, attachments: "سدة", imam: "ورنس عيد الصالح", khatib: "احمد جمال محمد", muezzin: "ورنس عيد الصالح", khadim: "ورنس عيد الصالح" },
    { name: "طارق بن زياد", city: "الدويري", location: "وسط البلد", category: "ب", type: "عام", area: 200, status: "متوسطة", isActive: true, isDestroyed: "لا يوجد", state: "جاهز", friday: true, attachments: "لا يوجد", imam: "حامد جميل محسن", khatib: "فارس علي المروح", muezzin: "حامد جميل محسن", khadim: "حامد جميل محسن" },
  ]

  const createdMosques = []
  for (const m of mosquesData) {
    const mosque = await prisma.mosque.create({ data: m })
    createdMosques.push(mosque)
  }

  // Create a mapping of mosque names to their IDs
  const mosqueMap = new Map(createdMosques.map(m => [m.name, m.id]))

  const workersData = [
    { name: "سامي ياسين الرفاعي", nationalId: "12020084911", mosqueId: mosqueMap.get("أم القرى"), role: "خطيب", education: "معهد متوسط عام", evaluation: "جيد", quranMem: "إجازة", salary: 1588, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "خلف محمود الهديب", nationalId: "13010043673", mosqueId: mosqueMap.get("أم القرى"), role: "إمام ومؤذن", education: "لا يوجد شهادة", evaluation: "وسط", quranMem: "1-4 جزء", salary: 8370, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "فارس خلف الهديب", nationalId: "13010043735", mosqueId: mosqueMap.get("أم القرى"), role: "خادم", education: "لا يوجد شهادة", evaluation: "وسط", quranMem: "1-4 جزء", salary: 7990, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "محمد شاتي البلعاس", nationalId: "13050055452", mosqueId: mosqueMap.get("أبو عبيدة بن الجراح"), role: "إمام وخطيب ومؤذن وخادم", education: "لا يوجد شهادة", evaluation: "وسط", quranMem: "1-4 جزء", salary: 8370, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "احمد جمال محمد", nationalId: "12020060748", mosqueId: mosqueMap.get("خالد بن الوليد 1"), role: "خطيب", education: "معهد متوسط عام", evaluation: "جيد", quranMem: "5-10 جزء", salary: 1588, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "طالب كلية شريعة سنة ثالثة" },
    { name: "ورنس عيد الصالح", nationalId: "13010019799", mosqueId: mosqueMap.get("خالد بن الوليد 1"), role: "إمام ومؤذن وخادم", education: "تعليم أساسي", evaluation: "جيد", quranMem: "1-4 جزء", salary: 8370, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "محمد عليان أبو ثليث", nationalId: "13010068896", mosqueId: mosqueMap.get("النور"), role: "إمام ومؤذن", education: "تعليم أساسي", evaluation: "ممتاز", quranMem: "1-4 جزء", salary: 1674, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "رضوان حسن الحريري", nationalId: "12100047949", mosqueId: mosqueMap.get("النور"), role: "خطيب", education: "ثانوية شرعية", evaluation: "جيد", quranMem: "11-20 جزء", salary: 7940, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "خالد عليان أبو ثليث", nationalId: "13010068891", mosqueId: mosqueMap.get("النور"), role: "خادم", education: "لا يوجد شهادة", evaluation: "وسط", quranMem: "1-4 جزء", salary: 7990, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "محمد أحمد الجوابرة", nationalId: "12010079118", mosqueId: mosqueMap.get("أسامة بن زيد"), role: "مؤذن وخادم", education: "تعليم أساسي", evaluation: "جيد", quranMem: "1-4 جزء", salary: 7990, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "عطا الله حسين الجوابرة", nationalId: "12010126331", mosqueId: mosqueMap.get("أسامة بن زيد"), role: "خطيب", education: "معهد متوسط عام", evaluation: "ممتاز", quranMem: "1-4 جزء", salary: 7940, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "أورنس محمد العنيزي", nationalId: "13010176327", mosqueId: mosqueMap.get("أسامة بن زيد"), role: "إمام", education: "إجازة في الشريعة", evaluation: "ممتاز", quranMem: "1-4 جزء", salary: 1674, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "فارس علي المروح", nationalId: "12100066289", mosqueId: mosqueMap.get("طارق بن زياد"), role: "خطيب", education: "ثانوية عامة", evaluation: "جيد", quranMem: "5-10 جزء", salary: 7940, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "حامد جميل محسن", nationalId: "12100068345", mosqueId: mosqueMap.get("طارق بن زياد"), role: "إمام ومؤذن وخادم", education: "تعليم أساسي", evaluation: "جيد", quranMem: "1-4 جزء", salary: 8370, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "فواز محمد المحمد", nationalId: "3320005231", mosqueId: mosqueMap.get("المسجد الكبير"), role: "إمام وخطيب", education: "تعليم أساسي", evaluation: "ممتاز", quranMem: "11-20 جزء", salary: 8370, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "خالد شلاش العويد", nationalId: "13050060939", mosqueId: mosqueMap.get("بلال الحبشي"), role: "خادم", education: "لا يوجد شهادة", evaluation: "وسط", quranMem: "1-4 جزء", salary: 7990, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "مضحي عايد الرمثان", nationalId: "13100026753", mosqueId: mosqueMap.get("أبو بكر الصديق"), role: "إمام ومؤذن وخادم", education: "لا يوجد شهادة", evaluation: "ممتاز", quranMem: "1-4 جزء", salary: 8370, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "هنيدي درويش الفهيد", nationalId: "13050056018", mosqueId: mosqueMap.get("المهاجرين"), role: "إمام ومؤذن", education: "معهد متوسط عام", evaluation: "جيد", quranMem: "1-4 جزء", salary: 8370, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "علي ثامر الحتيتي", nationalId: "13010198710", mosqueId: mosqueMap.get("المهاجرين"), role: "خادم", education: "لا يوجد شهادة", evaluation: "جيد", quranMem: "1-4 جزء", salary: 1598, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
    { name: "محمد علي راشد الحريري", nationalId: "12130045497", mosqueId: mosqueMap.get("المهاجرين"), role: "خطيب", education: "معهد متوسط عام", evaluation: "جيد", quranMem: "1-4 جزء", salary: 7940, salaryUSD: 0, status: "قائم على رأس عمله", kafala: "كفالة كلية", notes: "" },
  ]

  for (const w of workersData) {
    if (w.mosqueId) {
      await prisma.worker.create({ data: { ...w, mosqueId: w.mosqueId } })
    } else {
      console.warn(`Skipping worker ${w.name} - mosque not found`)
    }
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
