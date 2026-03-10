# L'EscoBar - نظام إدارة المقهى ☕

نظام متكامل لإدارة المقهى مع واجهة زبون وواجهة إدارة.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ المميزات

### واجهة الزبون 🛒
- عرض المنتجات بشكل جذاب مع الصور
- تصنيفات سهلة التنقل
- سلة طلبات ذكية
- اختيار الطاولة بسهولة
- تصميم متجاوب مع جميع الأجهزة

### واجهة الإدارة 👨‍💼
- إدارة الطلبات في الوقت الحقيقي
- سير عمل كامل للطلبات (جديد → مقبول → قيد التحضير → جاهز → تم التقديم → مدفوع)
- إشعارات صوتية للطلبات الجديدة
- إحصائيات وتقارير
- إدارة المنتجات والفئات والطاولات

## 🛠️ التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|----------|
| **Next.js 16** | Framework |
| **TypeScript** | اللغة |
| **Tailwind CSS** | التصميم |
| **Supabase** | قاعدة البيانات (PostgreSQL) |
| **Prisma** | ORM |
| **shadcn/ui** | مكونات UI |

## 🚀 البدء

### المتطلبات
- Node.js 18+
- Bun أو npm
- حساب Supabase

### التثبيت المحلي

```bash
# استنساخ المشروع
git clone https://github.com/XeoStudio/L-EscoBar.git
cd L-EscoBar

# تثبيت المتطلبات
bun install

# نسخ ملف البيئة
cp .env.example .env
```

### إعداد Supabase

1. أنشئ مشروع جديد في [Supabase](https://supabase.com)
2. اذهب إلى **Settings** → **Database**
3. انسخ **Transaction Pooler** و **Session Pooler** URLs
4. أضفها في ملف `.env`:

```env
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres"
```

### تشغيل المشروع

```bash
# إنشاء قاعدة البيانات
bun run db:push

# ملء البيانات الأولية
bun run db:seed

# تشغيل الخادم
bun run dev
```

## 🌐 النشر على Vercel

### الخطوة 1: ربط المستودع

1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل الدخول بـ GitHub
3. اضغط **"Add New"** → **"Project"**
4. اختر مستودع `XeoStudio/L-EscoBar`

### الخطوة 2: إعداد Environment Variables

أضف هذه المتغيرات في Vercel:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:6543/postgres` |
| `DIRECT_URL` | `postgresql://postgres.[REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres` |

### الخطوة 3: النشر

- اضغط **"Deploy"**
- انتظر اكتمال البناء
- ستحصل على رابط مثل: `https://l-escobar.vercel.app`

### الخطوة 4: إعداد Supabase للإنتاج

1. اذهب إلى **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. أضف نطاق Vercel في **Site URL** و **Redirect URLs**

## 🔐 بيانات الدخول الافتراضية

| الحقل | القيمة |
|-------|--------|
| البريد الإلكتروني | `admin@cafe.com` |
| كلمة المرور | `admin123` |

## 📁 هيكل المشروع

```
├── prisma/
│   ├── schema.prisma    # مخطط قاعدة البيانات
│   └── seed.ts          # البيانات الأولية
├── src/
│   ├── app/
│   │   ├── api/         # API Routes
│   │   └── page.tsx     # الصفحة الرئيسية
│   ├── components/
│   │   ├── cafe/        # مكونات التطبيق
│   │   └── ui/          # مكونات UI
│   ├── hooks/           # React Hooks
│   ├── lib/             # المكتبات
│   └── types/           # TypeScript Types
├── public/
│   └── download/        # الصور
└── .env                 # متغيرات البيئة
```

## 📱 سير عمل الطلبات

```
NEW → ACCEPTED → PREPARING → READY → SERVED → PAID
  ↓
CANCELLED
```

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ فرع جديد (`git checkout -b feature/amazing`)
3. اعمل commit (`git commit -m 'Add amazing feature'`)
4. ارفع الفرع (`git push origin feature/amazing`)
5. افتح Pull Request

## 📄 الترخيص

MIT License

---

**صنع بـ ❤️ لـ L'EscoBar**
