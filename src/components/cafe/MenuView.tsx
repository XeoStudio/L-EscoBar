'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Settings, Category, Product, Table, Order, OrderItem, OrderStatus, Reports, ORDER_STATUS_AR } from '@/types';
import { toast } from '@/hooks/use-toast';
import { 
  Home, 
  ShoppingCart, 
  ClipboardList, 
  MoreHorizontal,
  LayoutDashboard,
  UtensilsCrossed,
  Settings as SettingsIcon,
  Plus,
  Minus,
  X,
  Check,
  ChefHat,
  PackageCheck,
  HandPlatter,
  CreditCard,
  Coffee,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Bell,
  BellOff,
  LogIn,
  LogOut,
  Lock,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Store,
  Menu,
  Package,
  BarChart3,
  TableIcon,
  Layers,
  Database,
  Download,
  RefreshCcw,
  AlertTriangle,
  FileJson,
  Calendar,
  RefreshCcw as ResetIcon,
  Radio,
  Ban,
  Volume2,
  MapPin
} from 'lucide-react';

type AppLanguage = 'ar' | 'en' | 'fr';

const SUPPORTED_LANGUAGES: AppLanguage[] = ['ar', 'en', 'fr'];
const LANGUAGE_STORAGE_KEY = 'lescobar-language';
const ADMIN_ORDERS_POLL_INTERVAL_MS = 100;
const TRACKING_POLL_INTERVAL_MS = 100;
const TABLE_STATUS_POLL_INTERVAL_MS = 50;

const resolveLanguage = (value: string | null | undefined): AppLanguage | null => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.startsWith('ar')) return 'ar';
  if (normalized.startsWith('en')) return 'en';
  if (normalized.startsWith('fr')) return 'fr';
  return null;
};

const UI_TEXT: Record<AppLanguage, Record<string, string>> = {
  ar: {
    loading: 'جاري التحميل...',
    dashboard: 'لوحة التحكم',
    orders: 'الطلبات',
    menu: 'القائمة',
    database: 'البيانات',
    settings: 'الإعدادات',
    home: 'الرئيسية',
    cart: 'السلة',
    track: 'تتبع',
    more: 'المزيد',
    saveAllSettings: 'حفظ جميع الإعدادات',
    language: 'اللغة',
    languageDesc: 'اختر لغة الواجهة لكل الزوار ولوحة الإدارة',
    arabic: 'العربية',
    english: 'English',
    french: 'Français',
    appearance: 'المظهر',
    templatesSmart: 'قوالب ذكية حسب الوضع الحالي',
    darkRecommended: 'موصى به للوضع الداكن',
    lightRecommended: 'موصى به للوضع الفاتح',
    darkActiveHint: 'الوضع الداكن مفعل: نعرض قوالب بإضاءة منخفضة وألوان مريحة للعين.',
    lightActiveHint: 'الوضع الفاتح مفعل: نعرض قوالب واضحة ومضيئة للاستخدام النهاري.',
    altLight: 'قوالب بديلة (فاتحة)',
    altDark: 'قوالب بديلة (داكنة)',
    darkComfort: 'داكن مريح',
    lightProfessional: 'فاتح احترافي',
    chooseFromList: 'اختر من القائمة',
    livePreview: 'معاينة مباشرة للألوان',
    livePreviewDesc: 'هذا مثال سريع لكيف سيظهر التصميم للزوار.',
    primaryColorLabel: 'اللون الرئيسي',
    accentColorLabel: 'لون الإبراز',
    resetTheme: 'إعادة ألوان الثيم الافتراضية',
    darkMode: 'الوضع الداكن',
    darkModeDesc: 'تغيير مظهر التطبيق',
    notificationsSound: 'صوت الإشعارات',
    notificationsSoundDesc: 'تشغيل صوت عند وصول طلب جديد',
    trackOrder: 'تتبع طلبك',
    enterTrackingCode: 'أدخل كود التتبع لمعرفة حالة طلبك',
    noTrackedOrder: 'لا يوجد طلب للتتبع',
    adminLogin: 'تسجيل دخول الإدارة',
    adminLoginDesc: 'إدارة الطلبات والقائمة',
    systemLabel: 'نظام إدارة المقهى',
    welcomeDefault: 'مرحباً بك في مقهانا',
    all: 'الكل',
    overview: 'نظرة عامة',
    activeOrders: 'طلبات نشطة',
    todayRevenue: 'إيرادات اليوم',
    newOrders: 'طلبات جديدة',
    preparing: 'قيد التحضير',
    quickActions: 'إجراءات سريعة',
    manageOrders: 'إدارة الطلبات',
    manageMenu: 'إدارة القائمة',
    recentOrders: 'الطلبات الأخيرة',
    noOrders: 'لا توجد طلبات',
    noOrdersInFilter: 'لم يتم العثور على طلبات بهذا التصنيف',
    filterAll: 'الكل',
    filterNew: 'جديد',
    filterReady: 'جاهز',
    total: 'المجموع',
    table: 'طاولة',
    productCount: 'منتج',
    menuManagement: 'إدارة القائمة',
    categories: 'الفئات',
    products: 'المنتجات',
    tables: 'الطاولات',
    add: 'إضافة',
    noCategories: 'لا توجد فئات',
    noProducts: 'لا توجد منتجات',
    noTables: 'لا توجد طاولات',
    addTablesHint: 'أضف طاولات للمقهى',
    databaseManagement: 'إدارة البيانات',
    databaseStats: 'إحصائيات قاعدة البيانات',
    backup: 'النسخ الاحتياطي',
    exportData: 'تصدير البيانات',
    download: 'تحميل',
    deleteSpecificData: 'حذف بيانات محددة',
    dangerZone: 'منطقة الخطر',
    account: 'الحساب',
    logout: 'تسجيل الخروج',
    cafeInfo: 'معلومات المقهى',
    callUs: 'اتصل بنا',
    address: 'العنوان',
    workingHours: 'أوقات العمل',
    display: 'المظهر',
    version: 'الإصدار',
    cartEmpty: 'السلة فارغة',
    addFromMenu: 'أضف منتجات من القائمة',
    browseMenu: 'تصفح القائمة',
    selectedProducts: 'المنتجات المختارة',
    subtotal: 'المجموع الفرعي',
    tax: 'الضريبة',
    totalWithTax: 'الإجمالي',
    confirmOrder: 'تأكيد الطلب',
    trackingCodeHint: 'الكود مكون من 6 أحرف وأرقام',
    startTracking: 'بدء التتبع',
    tracking: 'جاري التتبع...',
    lastOrder: 'آخر طلب',
    live: 'مباشر',
    orderStages: 'مراحل الطلب',
    cancelledOrder: 'تم إلغاء هذا الطلب',
    orderReady: 'طلبك جاهز!',
    pickupNow: 'يمكنك المرور لاستلامه',
    items: 'المنتجات',
    time: 'الوقت',
    date: 'التاريخ',
    trackEmptyHint: 'أدخل الكود أعلاه لمتابعة طلبك',
    orderSent: 'تم إرسال طلبك!',
    keepTrackingCode: 'احتفظ بكود التتبع لمتابعة طلبك',
    trackingCode: 'كود التتبع',
    copyCode: 'نسخ الكود',
    close: 'إغلاق',
    continueTracking: 'متابعة الطلب',
    adminEmail: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    verifyInProgress: 'جاري التحقق...',
    orderConfirmation: 'تأكيد الطلب',
    tableNumber: 'رقم الطاولة',
    noTablesAvailable: 'لا توجد طاولات متاحة',
    blockedTablesHint: 'الطاولات المحجوبة لديها طلبات جارية',
    orderLabel: 'الطلب',
    sending: 'جاري الإرسال...',
    cancel: 'إلغاء',
    loadingShort: 'جاري...',
    acceptOrder: 'قبول الطلب',
    startPreparing: 'بدء التحضير',
    prepared: 'تم التحضير',
    served: 'تم التقديم',
    paid: 'تم الدفع',
    settingsTitle: 'الإعدادات',
    cafeInfoSection: 'معلومات المقهى',
    cafeNameLabel: 'اسم المقهى',
    cafeNamePlaceholder: 'اسم المقهى',
    cafeLogoLabel: 'شعار المقهى (رابط صورة)',
    phoneLabel: 'رقم الهاتف',
    welcomeMessageLabel: 'رسالة الترحيب',
    openingHoursSection: 'أوقات العمل',
    openingTime: 'وقت الفتح',
    closingTime: 'وقت الإغلاق',
    financialSettings: 'الإعدادات المالية',
    currencyLabel: 'العملة',
    services: 'الخدمات',
    acceptOrders: 'قبول الطلبات',
    acceptOrdersDesc: 'السماح للعملاء بتقديم طلبات جديدة',
    smartSuggestionsByPrimary: 'اقتراحات ذكية حسب اللون الرئيسي',
    primaryColor: 'اللون الرئيسي',
    accentColor: 'لون الإبراز',
    backgroundColor: 'لون الخلفية',
    surfaceColor: 'لون الأسطح',
    textPrimaryColor: 'لون النص الأساسي',
    workingHoursLabel: 'ساعات العمل',
    notAcceptingOrdersNow: 'غير مستقبلين طلبات حالياً',
    inCart: 'في السلة',
    noProductsInCategory: 'لا توجد منتجات في هذه الفئة حالياً',
    orderItems: 'المنتجات المختارة',
    adminLoginTitle: 'تسجيل دخول الإدارة',
    orderItemWord: 'منتج',
    onlyAvailableTables: 'لا توجد طاولات متاحة',
    themeBalanced: 'متوازن',
    themeBalancedHint: 'متزن ومريح للعين',
    themeBold: 'جريء',
    themeBoldHint: 'تباين أوضح وحضور أقوى',
    themeSoft: 'ناعم',
    themeSoftHint: 'ألوان هادئة وتجربة لطيفة',
    newOrderAlertTitle: '🔔 طلب جديد!',
    newOrderAlertDesc: 'لديك',
    newOrderCountSuffix: 'طلب جديد',
    readyOrderAlertTitle: '🎉 طلبك جاهز!',
    readyOrderAlertDesc: 'يمكنك استلام طلبك الآن',
    loginSuccessTitle: '✅ تم تسجيل الدخول',
    loginSuccessDesc: 'مرحباً بك في لوحة الإدارة',
    loginErrorTitle: '❌ خطأ',
    loginErrorDesc: 'فشل تسجيل الدخول',
    logoutSuccessTitle: '👋 تم تسجيل الخروج',
    logoutSuccessDesc: 'تم تسجيل خروجك بنجاح',
    genericErrorTitle: '❌ خطأ',
    warningTitle: '⚠️ تنبيه',
    requiredFieldsMsg: 'يرجى ملء جميع الحقول المطلوبة',
    productUpdatedMsg: 'تم تعديل المنتج',
    productAddedMsg: 'تم إضافة المنتج',
    productSaveFailedMsg: 'فشل في حفظ المنتج',
    serverConnectionFailedMsg: 'فشل في الاتصال بالخادم',
    confirmDeleteProduct: 'هل أنت متأكد من حذف هذا المنتج؟',
    productDeletedMsg: 'تم حذف المنتج',
    productDeleteFailedMsg: 'فشل في حذف المنتج',
    categoryNameRequiredMsg: 'يرجى إدخال اسم الفئة باللغتين',
    categoryUpdatedMsg: 'تم تعديل الفئة',
    categoryAddedMsg: 'تم إضافة الفئة',
    categorySaveFailedMsg: 'فشل في حفظ الفئة',
    confirmDeleteCategory: 'هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف جميع المنتجات التابعة لها.',
    categoryDeletedMsg: 'تم حذف الفئة',
    categoryDeleteFailedMsg: 'فشل في حذف الفئة',
    invalidTableNumberMsg: 'يرجى إدخال رقم صحيح للطاولة',
    tableUpdatedMsg: 'تم تعديل الطاولة',
    tableUpdateFailedMsg: 'فشل في تعديل الطاولة',
    tableAddedMsg: 'تم إضافة الطاولة بنجاح',
    tableAddFailedMsg: 'فشل في إضافة الطاولة',
    confirmDeleteTable: 'هل أنت متأكد من حذف هذه الطاولة؟',
    tableDeletedMsg: 'تم حذف الطاولة',
    tableDeleteFailedMsg: 'فشل في حذف الطاولة',
    backupSuccessTitle: '✅ تم',
    backupSuccessMsg: 'تم تحميل النسخة الاحتياطية بنجاح',
    backupFailedMsg: 'فشل في إنشاء النسخة الاحتياطية',
    confirmDeleteOldOrders: 'هل أنت متأكد من حذف الطلبات الأقدم من',
    dayWord: 'يوم',
    ordersDeletedTitle: '✅ تم الحذف',
    deleteOrdersFailedMsg: 'فشل في حذف الطلبات',
    confirmDeleteAllOrders: 'هل أنت متأكد من حذف جميع الطلبات؟ هذا الإجراء لا يمكن التراجع عنه!',
    confirmDeleteAllProducts: 'هل أنت متأكد من حذف جميع المنتجات؟ سيتم حذف الطلبات أيضاً!',
    deleteProductsFailedMsg: 'فشل في حذف المنتجات',
    confirmDeleteAllCategories: 'هل أنت متأكد من حذف جميع الفئات؟ سيتم حذف المنتجات والطلبات أيضاً!',
    deleteCategoriesFailedMsg: 'فشل في حذف الفئات',
    confirmDeleteAllTables: 'هل أنت متأكد من حذف جميع الطاولات؟ سيتم حذف الطلبات أيضاً!',
    deleteTablesFailedMsg: 'فشل في حذف الطاولات',
    fullResetConfirmStep1: '⚠️ تحذير! سيتم حذف جميع البيانات نهائياً!\n\nسيتم حذف:\n- جميع الطلبات\n- جميع المنتجات\n- جميع الفئات\n- جميع الطاولات\n- الإعدادات\n\nلن يتم حذف حساب المسؤول.\n\nهل أنت متأكد؟',
    fullResetConfirmStep2: '⚠️ هذا الإجراء لا يمكن التراجع عنه!\n\nهل أنت متأكد 100%؟',
    resetDoneTitle: '✅ تم إعادة الضبط',
    resetFailedMsg: 'فشل في إعادة ضبط قاعدة البيانات',
    dbOrdersLabel: 'طلبات',
    dbProductsLabel: 'منتجات',
    dbCategoriesLabel: 'فئات',
    dbTablesLabel: 'طاولات',
    backupDesc: 'تحميل نسخة احتياطية كاملة بصيغة JSON',
    oldOrdersTitle: 'طلبات قديمة',
    dayAndOlder: 'يوم وأقدم',
    allOrdersTitle: 'جميع الطلبات',
    allProductsTitle: 'جميع المنتجات',
    allCategoriesTitle: 'جميع الفئات',
    allTablesTitle: 'جميع الطاولات',
    factoryResetTitle: 'إعادة ضبط المصنع',
    factoryResetDesc: 'سيتم حذف جميع البيانات نهائياً: الطلبات، المنتجات، الفئات، الطاولات، الإعدادات',
    adminProtectedMsg: '✓ حساب المسؤول محمي ولن يتم حذفه',
    resetDatabaseBtn: 'إعادة ضبط قاعدة البيانات',
    resetWarningText: 'تحذير! هذا الإجراء لا يمكن التراجع عنه',
    confirmDeleteBtn: 'تأكيد الحذف',
    addressPlaceholder: 'شارع المثال، المدينة',
    welcomePlaceholder: 'مرحباً بك في مقهانا',
    currencyPlaceholder: 'د.ت',
    editProductTitle: 'تعديل المنتج',
    addProductTitle: 'إضافة منتج',
    productNameArLabel: 'اسم المنتج (عربي)',
    productNameEnLabel: 'اسم المنتج (إنجليزي)',
    priceLabel: 'السعر',
    categoryLabel: 'الفئة',
    chooseCategory: 'اختر الفئة',
    imageUrlLabel: 'رابط الصورة',
    availableLabel: 'متوفر',
    saveChanges: 'حفظ التغييرات',
    addProductAction: 'إضافة المنتج',
    editCategoryTitle: 'تعديل الفئة',
    addCategoryTitle: 'إضافة فئة',
    categoryNameArLabel: 'اسم الفئة (عربي)',
    categoryNameEnLabel: 'اسم الفئة (إنجليزي)',
    addCategoryAction: 'إضافة الفئة',
    editTableTitle: 'تعديل الطاولة',
    addTableTitle: 'إضافة طاولة',
    seatsLabel: 'عدد المقاعد',
    save: 'حفظ',
    actionDelete: 'حذف',
    adminAccountSection: 'حساب الإدارة',
    adminAccountDesc: 'تحديث بريد وكلمة مرور حساب المسؤول',
    adminEmailLabel: 'بريد الإدارة',
    newPasswordLabel: 'كلمة مرور جديدة',
    newPasswordPlaceholder: 'اتركها فارغة للإبقاء على الحالية',
    adminAccountSave: 'تحديث حساب الإدارة',
    adminAccountUpdatedMsg: 'تم تحديث حساب الإدارة',
    adminAccountUpdateFailedMsg: 'فشل في تحديث حساب الإدارة',
    driveLinkBtn: 'رابط Google Drive',
    driveLinkPrompt: 'الصق رابط مشاركة Google Drive هنا',
    invalidDriveLinkMsg: 'رابط Google Drive غير صالح',
    imageUploadFailedMsg: 'فشل في تحميل الصورة',
    imageUploadSuccessMsg: 'تم تحديث الصورة',
    imageLinkSetMsg: 'تم حفظ رابط الصورة',
    imageLinkInvalidMsg: 'يرجى إدخال رابط صالح يبدأ بـ http',
    imageLinkUnreachableMsg: 'تعذر الوصول إلى رابط الصورة',
  },
  en: {
    loading: 'Loading...',
    dashboard: 'Dashboard',
    orders: 'Orders',
    menu: 'Menu',
    database: 'Database',
    settings: 'Settings',
    home: 'Home',
    cart: 'Cart',
    track: 'Track',
    more: 'More',
    saveAllSettings: 'Save All Settings',
    language: 'Language',
    languageDesc: 'Choose interface language for customers and admin panel',
    arabic: 'Arabic',
    english: 'English',
    french: 'French',
    appearance: 'Appearance',
    templatesSmart: 'Smart templates for current mode',
    darkRecommended: 'Recommended for dark mode',
    lightRecommended: 'Recommended for light mode',
    darkActiveHint: 'Dark mode is active: showing low-light templates for better eye comfort.',
    lightActiveHint: 'Light mode is active: showing bright and clear daytime templates.',
    altLight: 'Alternative templates (light)',
    altDark: 'Alternative templates (dark)',
    darkComfort: 'Comfort Dark',
    lightProfessional: 'Professional Light',
    chooseFromList: 'Choose from list',
    livePreview: 'Live color preview',
    livePreviewDesc: 'Quick preview of how visitors will see your design.',
    primaryColorLabel: 'Primary color',
    accentColorLabel: 'Accent color',
    resetTheme: 'Reset theme colors to default',
    darkMode: 'Dark mode',
    darkModeDesc: 'Switch app appearance',
    notificationsSound: 'Notification sound',
    notificationsSoundDesc: 'Play a sound when a new order arrives',
    trackOrder: 'Track your order',
    enterTrackingCode: 'Enter tracking code to see order status',
    noTrackedOrder: 'No tracked order yet',
    adminLogin: 'Admin Login',
    adminLoginDesc: 'Manage orders and menu',
    systemLabel: 'Cafe Management System',
    welcomeDefault: 'Welcome to our cafe',
    all: 'All',
    overview: 'Overview',
    activeOrders: 'Active orders',
    todayRevenue: 'Today revenue',
    newOrders: 'New orders',
    preparing: 'Preparing',
    quickActions: 'Quick actions',
    manageOrders: 'Manage orders',
    manageMenu: 'Manage menu',
    recentOrders: 'Recent orders',
    noOrders: 'No orders yet',
    noOrdersInFilter: 'No orders found for this filter',
    filterAll: 'All',
    filterNew: 'New',
    filterReady: 'Ready',
    total: 'Total',
    table: 'Table',
    productCount: 'items',
    menuManagement: 'Menu management',
    categories: 'Categories',
    products: 'Products',
    tables: 'Tables',
    add: 'Add',
    noCategories: 'No categories',
    noProducts: 'No products',
    noTables: 'No tables',
    addTablesHint: 'Add cafe tables',
    databaseManagement: 'Data management',
    databaseStats: 'Database stats',
    backup: 'Backup',
    exportData: 'Export data',
    download: 'Download',
    deleteSpecificData: 'Delete specific data',
    dangerZone: 'Danger zone',
    account: 'Account',
    logout: 'Log out',
    cafeInfo: 'Cafe info',
    callUs: 'Call us',
    address: 'Address',
    workingHours: 'Working hours',
    display: 'Display',
    version: 'Version',
    cartEmpty: 'Cart is empty',
    addFromMenu: 'Add products from menu',
    browseMenu: 'Browse menu',
    selectedProducts: 'Selected products',
    subtotal: 'Subtotal',
    tax: 'Tax',
    totalWithTax: 'Total',
    confirmOrder: 'Confirm order',
    trackingCodeHint: 'Code contains 6 letters and numbers',
    startTracking: 'Start tracking',
    tracking: 'Tracking...',
    lastOrder: 'Last order',
    live: 'Live',
    orderStages: 'Order stages',
    cancelledOrder: 'This order was cancelled',
    orderReady: 'Your order is ready!',
    pickupNow: 'You can pick it up now',
    items: 'Items',
    time: 'Time',
    date: 'Date',
    trackEmptyHint: 'Enter the code above to follow your order',
    orderSent: 'Your order has been sent!',
    keepTrackingCode: 'Keep your tracking code to follow your order',
    trackingCode: 'Tracking code',
    copyCode: 'Copy code',
    close: 'Close',
    continueTracking: 'Track order',
    adminEmail: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    verifyInProgress: 'Verifying...',
    orderConfirmation: 'Order confirmation',
    tableNumber: 'Table number',
    noTablesAvailable: 'No tables available',
    blockedTablesHint: 'Blocked tables have active orders',
    orderLabel: 'Order',
    sending: 'Sending...',
    cancel: 'Cancel',
    loadingShort: 'Loading...',
    acceptOrder: 'Accept order',
    startPreparing: 'Start preparation',
    prepared: 'Prepared',
    served: 'Served',
    paid: 'Paid',
    settingsTitle: 'Settings',
    cafeInfoSection: 'Cafe information',
    cafeNameLabel: 'Cafe name',
    cafeNamePlaceholder: 'Cafe name',
    cafeLogoLabel: 'Cafe logo (image URL)',
    phoneLabel: 'Phone number',
    welcomeMessageLabel: 'Welcome message',
    openingHoursSection: 'Opening hours',
    openingTime: 'Opening time',
    closingTime: 'Closing time',
    financialSettings: 'Financial settings',
    currencyLabel: 'Currency',
    services: 'Services',
    acceptOrders: 'Accept orders',
    acceptOrdersDesc: 'Allow customers to place new orders',
    smartSuggestionsByPrimary: 'Smart suggestions by primary color',
    primaryColor: 'Primary color',
    accentColor: 'Accent color',
    backgroundColor: 'Background color',
    surfaceColor: 'Surface color',
    textPrimaryColor: 'Primary text color',
    workingHoursLabel: 'Working hours',
    notAcceptingOrdersNow: 'We are not accepting orders right now',
    inCart: 'in cart',
    noProductsInCategory: 'No products in this category right now',
    orderItems: 'Selected products',
    adminLoginTitle: 'Admin login',
    orderItemWord: 'items',
    onlyAvailableTables: 'No tables available',
    themeBalanced: 'Balanced',
    themeBalancedHint: 'Well-balanced and easy on the eyes',
    themeBold: 'Bold',
    themeBoldHint: 'Stronger contrast and presence',
    themeSoft: 'Soft',
    themeSoftHint: 'Calm colors and gentle feel',
    newOrderAlertTitle: '🔔 New order!',
    newOrderAlertDesc: 'You have',
    newOrderCountSuffix: 'new orders',
    readyOrderAlertTitle: '🎉 Your order is ready!',
    readyOrderAlertDesc: 'You can pick up your order now',
    loginSuccessTitle: '✅ Logged in',
    loginSuccessDesc: 'Welcome to the admin dashboard',
    loginErrorTitle: '❌ Error',
    loginErrorDesc: 'Login failed',
    logoutSuccessTitle: '👋 Logged out',
    logoutSuccessDesc: 'You have been logged out successfully',
    genericErrorTitle: '❌ Error',
    warningTitle: '⚠️ Warning',
    requiredFieldsMsg: 'Please fill in all required fields',
    productUpdatedMsg: 'Product updated',
    productAddedMsg: 'Product added',
    productSaveFailedMsg: 'Failed to save product',
    serverConnectionFailedMsg: 'Failed to connect to server',
    confirmDeleteProduct: 'Are you sure you want to delete this product?',
    productDeletedMsg: 'Product deleted',
    productDeleteFailedMsg: 'Failed to delete product',
    categoryNameRequiredMsg: 'Please enter category name in both languages',
    categoryUpdatedMsg: 'Category updated',
    categoryAddedMsg: 'Category added',
    categorySaveFailedMsg: 'Failed to save category',
    confirmDeleteCategory: 'Are you sure you want to delete this category? All related products will be deleted.',
    categoryDeletedMsg: 'Category deleted',
    categoryDeleteFailedMsg: 'Failed to delete category',
    invalidTableNumberMsg: 'Please enter a valid table number',
    tableUpdatedMsg: 'Table updated',
    tableUpdateFailedMsg: 'Failed to update table',
    tableAddedMsg: 'Table added successfully',
    tableAddFailedMsg: 'Failed to add table',
    confirmDeleteTable: 'Are you sure you want to delete this table?',
    tableDeletedMsg: 'Table deleted',
    tableDeleteFailedMsg: 'Failed to delete table',
    backupSuccessTitle: '✅ Done',
    backupSuccessMsg: 'Backup downloaded successfully',
    backupFailedMsg: 'Failed to create backup',
    confirmDeleteOldOrders: 'Are you sure you want to delete orders older than',
    dayWord: 'day(s)',
    ordersDeletedTitle: '✅ Deleted',
    deleteOrdersFailedMsg: 'Failed to delete orders',
    confirmDeleteAllOrders: 'Are you sure you want to delete all orders? This action cannot be undone!',
    confirmDeleteAllProducts: 'Are you sure you want to delete all products? Orders will also be deleted!',
    deleteProductsFailedMsg: 'Failed to delete products',
    confirmDeleteAllCategories: 'Are you sure you want to delete all categories? Products and orders will also be deleted!',
    deleteCategoriesFailedMsg: 'Failed to delete categories',
    confirmDeleteAllTables: 'Are you sure you want to delete all tables? Orders will also be deleted!',
    deleteTablesFailedMsg: 'Failed to delete tables',
    fullResetConfirmStep1: '⚠️ Warning! All data will be permanently deleted!\n\nThis will delete:\n- all orders\n- all products\n- all categories\n- all tables\n- settings\n\nAdmin account will not be deleted.\n\nAre you sure?',
    fullResetConfirmStep2: '⚠️ This action cannot be undone!\n\nAre you 100% sure?',
    resetDoneTitle: '✅ Reset completed',
    resetFailedMsg: 'Failed to reset database',
    dbOrdersLabel: 'Orders',
    dbProductsLabel: 'Products',
    dbCategoriesLabel: 'Categories',
    dbTablesLabel: 'Tables',
    backupDesc: 'Download a full JSON backup',
    oldOrdersTitle: 'Old orders',
    dayAndOlder: 'days and older',
    allOrdersTitle: 'All orders',
    allProductsTitle: 'All products',
    allCategoriesTitle: 'All categories',
    allTablesTitle: 'All tables',
    factoryResetTitle: 'Factory reset',
    factoryResetDesc: 'All data will be permanently deleted: orders, products, categories, tables, settings',
    adminProtectedMsg: '✓ Admin account is protected and will not be deleted',
    resetDatabaseBtn: 'Reset database',
    resetWarningText: 'Warning! This action cannot be undone',
    confirmDeleteBtn: 'Confirm deletion',
    addressPlaceholder: 'Example street, city',
    welcomePlaceholder: 'Welcome to our cafe',
    currencyPlaceholder: 'TND',
    editProductTitle: 'Edit product',
    addProductTitle: 'Add product',
    productNameArLabel: 'Product name (Arabic)',
    productNameEnLabel: 'Product name (English)',
    priceLabel: 'Price',
    categoryLabel: 'Category',
    chooseCategory: 'Choose category',
    imageUrlLabel: 'Image URL',
    availableLabel: 'Available',
    saveChanges: 'Save changes',
    addProductAction: 'Add product',
    editCategoryTitle: 'Edit category',
    addCategoryTitle: 'Add category',
    categoryNameArLabel: 'Category name (Arabic)',
    categoryNameEnLabel: 'Category name (English)',
    addCategoryAction: 'Add category',
    editTableTitle: 'Edit table',
    addTableTitle: 'Add table',
    seatsLabel: 'Seats',
    save: 'Save',
    actionDelete: 'Delete',
    adminAccountSection: 'Admin account',
    adminAccountDesc: 'Update the admin email and password',
    adminEmailLabel: 'Admin email',
    newPasswordLabel: 'New password',
    newPasswordPlaceholder: 'Leave blank to keep current password',
    adminAccountSave: 'Update admin account',
    adminAccountUpdatedMsg: 'Admin account updated',
    adminAccountUpdateFailedMsg: 'Failed to update admin account',
    driveLinkBtn: 'Google Drive link',
    driveLinkPrompt: 'Paste a Google Drive share link',
    invalidDriveLinkMsg: 'Invalid Google Drive link',
    imageUploadFailedMsg: 'Failed to load image',
    imageUploadSuccessMsg: 'Image updated',
    imageLinkSetMsg: 'Image link saved',
    imageLinkInvalidMsg: 'Please enter a valid link starting with http',
    imageLinkUnreachableMsg: 'Image link could not be reached',
  },
  fr: {
    loading: 'Chargement...',
    dashboard: 'Tableau de bord',
    orders: 'Commandes',
    menu: 'Menu',
    database: 'Base de donnees',
    settings: 'Parametres',
    home: 'Accueil',
    cart: 'Panier',
    track: 'Suivi',
    more: 'Plus',
    saveAllSettings: 'Enregistrer tous les parametres',
    language: 'Langue',
    languageDesc: 'Choisissez la langue pour les clients et l\'administration',
    arabic: 'Arabe',
    english: 'Anglais',
    french: 'Francais',
    appearance: 'Apparence',
    templatesSmart: 'Modeles intelligents selon le mode',
    darkRecommended: 'Recommande pour mode sombre',
    lightRecommended: 'Recommande pour mode clair',
    darkActiveHint: 'Le mode sombre est actif: modeles a faible luminosite pour plus de confort.',
    lightActiveHint: 'Le mode clair est actif: modeles lumineux et lisibles pour la journee.',
    altLight: 'Modeles alternatifs (clair)',
    altDark: 'Modeles alternatifs (sombre)',
    darkComfort: 'Sombre Confort',
    lightProfessional: 'Clair Pro',
    chooseFromList: 'Choisir depuis la liste',
    livePreview: 'Apercu en direct des couleurs',
    livePreviewDesc: 'Apercu rapide de l\'affichage pour les visiteurs.',
    primaryColorLabel: 'Couleur principale',
    accentColorLabel: 'Couleur accent',
    resetTheme: 'Reinitialiser les couleurs du theme',
    darkMode: 'Mode sombre',
    darkModeDesc: 'Changer l\'apparence de l\'application',
    notificationsSound: 'Son des notifications',
    notificationsSoundDesc: 'Jouer un son a l\'arrivee d\'une nouvelle commande',
    trackOrder: 'Suivre votre commande',
    enterTrackingCode: 'Entrez le code pour voir le statut',
    noTrackedOrder: 'Aucune commande suivie',
    adminLogin: 'Connexion Admin',
    adminLoginDesc: 'Gerer les commandes et le menu',
    systemLabel: 'Systeme de gestion du cafe',
    welcomeDefault: 'Bienvenue dans notre cafe',
    all: 'Tout',
    overview: 'Apercu',
    activeOrders: 'Commandes actives',
    todayRevenue: 'Revenu du jour',
    newOrders: 'Nouvelles commandes',
    preparing: 'Preparation',
    quickActions: 'Actions rapides',
    manageOrders: 'Gerer commandes',
    manageMenu: 'Gerer menu',
    recentOrders: 'Commandes recentes',
    noOrders: 'Aucune commande',
    noOrdersInFilter: 'Aucune commande pour ce filtre',
    filterAll: 'Tout',
    filterNew: 'Nouvelle',
    filterReady: 'Prete',
    total: 'Total',
    table: 'Table',
    productCount: 'articles',
    menuManagement: 'Gestion du menu',
    categories: 'Categories',
    products: 'Produits',
    tables: 'Tables',
    add: 'Ajouter',
    noCategories: 'Aucune categorie',
    noProducts: 'Aucun produit',
    noTables: 'Aucune table',
    addTablesHint: 'Ajoutez des tables au cafe',
    databaseManagement: 'Gestion des donnees',
    databaseStats: 'Statistiques base',
    backup: 'Sauvegarde',
    exportData: 'Exporter les donnees',
    download: 'Telecharger',
    deleteSpecificData: 'Supprimer des donnees',
    dangerZone: 'Zone de danger',
    account: 'Compte',
    logout: 'Deconnexion',
    cafeInfo: 'Infos du cafe',
    callUs: 'Appelez-nous',
    address: 'Adresse',
    workingHours: 'Horaires',
    display: 'Affichage',
    version: 'Version',
    cartEmpty: 'Panier vide',
    addFromMenu: 'Ajoutez des produits du menu',
    browseMenu: 'Parcourir menu',
    selectedProducts: 'Produits selectionnes',
    subtotal: 'Sous-total',
    tax: 'Taxe',
    totalWithTax: 'Total',
    confirmOrder: 'Confirmer commande',
    trackingCodeHint: 'Le code contient 6 lettres et chiffres',
    startTracking: 'Demarrer suivi',
    tracking: 'Suivi en cours...',
    lastOrder: 'Derniere commande',
    live: 'En direct',
    orderStages: 'Etapes de commande',
    cancelledOrder: 'Cette commande est annulee',
    orderReady: 'Votre commande est prete!',
    pickupNow: 'Vous pouvez la recuperer maintenant',
    items: 'Produits',
    time: 'Heure',
    date: 'Date',
    trackEmptyHint: 'Entrez le code ci-dessus pour suivre la commande',
    orderSent: 'Votre commande est envoyee!',
    keepTrackingCode: 'Gardez le code de suivi pour suivre votre commande',
    trackingCode: 'Code de suivi',
    copyCode: 'Copier le code',
    close: 'Fermer',
    continueTracking: 'Suivre commande',
    adminEmail: 'Email',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    verifyInProgress: 'Verification...',
    orderConfirmation: 'Confirmation commande',
    tableNumber: 'Numero de table',
    noTablesAvailable: 'Aucune table disponible',
    blockedTablesHint: 'Les tables bloquees ont des commandes actives',
    orderLabel: 'Commande',
    sending: 'Envoi en cours...',
    cancel: 'Annuler',
    loadingShort: 'Chargement...',
    acceptOrder: 'Accepter commande',
    startPreparing: 'Demarrer preparation',
    prepared: 'Preparation terminee',
    served: 'Servie',
    paid: 'Payee',
    settingsTitle: 'Parametres',
    cafeInfoSection: 'Informations du cafe',
    cafeNameLabel: 'Nom du cafe',
    cafeNamePlaceholder: 'Nom du cafe',
    cafeLogoLabel: 'Logo du cafe (URL image)',
    phoneLabel: 'Numero de telephone',
    welcomeMessageLabel: 'Message de bienvenue',
    openingHoursSection: 'Horaires',
    openingTime: 'Heure d\'ouverture',
    closingTime: 'Heure de fermeture',
    financialSettings: 'Parametres financiers',
    currencyLabel: 'Devise',
    services: 'Services',
    acceptOrders: 'Accepter les commandes',
    acceptOrdersDesc: 'Autoriser les clients a passer de nouvelles commandes',
    smartSuggestionsByPrimary: 'Suggestions intelligentes selon la couleur principale',
    primaryColor: 'Couleur principale',
    accentColor: 'Couleur accent',
    backgroundColor: 'Couleur de fond',
    surfaceColor: 'Couleur des surfaces',
    textPrimaryColor: 'Couleur du texte principal',
    workingHoursLabel: 'Heures de travail',
    notAcceptingOrdersNow: 'Nous n\'acceptons pas de commandes actuellement',
    inCart: 'au panier',
    noProductsInCategory: 'Aucun produit dans cette categorie pour le moment',
    orderItems: 'Produits selectionnes',
    adminLoginTitle: 'Connexion admin',
    orderItemWord: 'articles',
    onlyAvailableTables: 'Aucune table disponible',
    themeBalanced: 'Equilibre',
    themeBalancedHint: 'Harmonieux et confortable pour les yeux',
    themeBold: 'Audacieux',
    themeBoldHint: 'Contraste plus fort et presence marquee',
    themeSoft: 'Doux',
    themeSoftHint: 'Couleurs calmes et experience agreable',
    newOrderAlertTitle: '🔔 Nouvelle commande!',
    newOrderAlertDesc: 'Vous avez',
    newOrderCountSuffix: 'nouvelles commandes',
    readyOrderAlertTitle: '🎉 Votre commande est prete!',
    readyOrderAlertDesc: 'Vous pouvez recuperer votre commande maintenant',
    loginSuccessTitle: '✅ Connecte',
    loginSuccessDesc: 'Bienvenue dans le tableau de bord admin',
    loginErrorTitle: '❌ Erreur',
    loginErrorDesc: 'Echec de connexion',
    logoutSuccessTitle: '👋 Deconnecte',
    logoutSuccessDesc: 'Vous etes deconnecte avec succes',
    genericErrorTitle: '❌ Erreur',
    warningTitle: '⚠️ Alerte',
    requiredFieldsMsg: 'Veuillez remplir tous les champs obligatoires',
    productUpdatedMsg: 'Produit modifie',
    productAddedMsg: 'Produit ajoute',
    productSaveFailedMsg: 'Echec de sauvegarde du produit',
    serverConnectionFailedMsg: 'Echec de connexion au serveur',
    confirmDeleteProduct: 'Voulez-vous vraiment supprimer ce produit?',
    productDeletedMsg: 'Produit supprime',
    productDeleteFailedMsg: 'Echec de suppression du produit',
    categoryNameRequiredMsg: 'Veuillez saisir le nom de la categorie dans les deux langues',
    categoryUpdatedMsg: 'Categorie modifiee',
    categoryAddedMsg: 'Categorie ajoutee',
    categorySaveFailedMsg: 'Echec de sauvegarde de la categorie',
    confirmDeleteCategory: 'Voulez-vous vraiment supprimer cette categorie? Tous les produits associes seront supprimes.',
    categoryDeletedMsg: 'Categorie supprimee',
    categoryDeleteFailedMsg: 'Echec de suppression de la categorie',
    invalidTableNumberMsg: 'Veuillez saisir un numero de table valide',
    tableUpdatedMsg: 'Table modifiee',
    tableUpdateFailedMsg: 'Echec de modification de la table',
    tableAddedMsg: 'Table ajoutee avec succes',
    tableAddFailedMsg: 'Echec d\'ajout de la table',
    confirmDeleteTable: 'Voulez-vous vraiment supprimer cette table?',
    tableDeletedMsg: 'Table supprimee',
    tableDeleteFailedMsg: 'Echec de suppression de la table',
    backupSuccessTitle: '✅ Termine',
    backupSuccessMsg: 'Sauvegarde telechargee avec succes',
    backupFailedMsg: 'Echec de creation de la sauvegarde',
    confirmDeleteOldOrders: 'Voulez-vous vraiment supprimer les commandes de plus de',
    dayWord: 'jour(s)',
    ordersDeletedTitle: '✅ Supprime',
    deleteOrdersFailedMsg: 'Echec de suppression des commandes',
    confirmDeleteAllOrders: 'Voulez-vous vraiment supprimer toutes les commandes? Cette action est irreversible!',
    confirmDeleteAllProducts: 'Voulez-vous vraiment supprimer tous les produits? Les commandes seront aussi supprimees!',
    deleteProductsFailedMsg: 'Echec de suppression des produits',
    confirmDeleteAllCategories: 'Voulez-vous vraiment supprimer toutes les categories? Les produits et commandes seront aussi supprimes!',
    deleteCategoriesFailedMsg: 'Echec de suppression des categories',
    confirmDeleteAllTables: 'Voulez-vous vraiment supprimer toutes les tables? Les commandes seront aussi supprimees!',
    deleteTablesFailedMsg: 'Echec de suppression des tables',
    fullResetConfirmStep1: '⚠️ Attention! Toutes les donnees seront supprimees definitivement!\n\nCela supprimera:\n- toutes les commandes\n- tous les produits\n- toutes les categories\n- toutes les tables\n- les parametres\n\nLe compte admin ne sera pas supprime.\n\nEtes-vous sur?',
    fullResetConfirmStep2: '⚠️ Cette action est irreversible!\n\nEtes-vous sur a 100%?',
    resetDoneTitle: '✅ Reinitialisation terminee',
    resetFailedMsg: 'Echec de reinitialisation de la base',
    dbOrdersLabel: 'Commandes',
    dbProductsLabel: 'Produits',
    dbCategoriesLabel: 'Categories',
    dbTablesLabel: 'Tables',
    backupDesc: 'Telecharger une sauvegarde JSON complete',
    oldOrdersTitle: 'Anciennes commandes',
    dayAndOlder: 'jours et plus',
    allOrdersTitle: 'Toutes les commandes',
    allProductsTitle: 'Tous les produits',
    allCategoriesTitle: 'Toutes les categories',
    allTablesTitle: 'Toutes les tables',
    factoryResetTitle: 'Reinitialisation usine',
    factoryResetDesc: 'Toutes les donnees seront supprimees definitivement: commandes, produits, categories, tables, parametres',
    adminProtectedMsg: '✓ Le compte admin est protege et ne sera pas supprime',
    resetDatabaseBtn: 'Reinitialiser la base de donnees',
    resetWarningText: 'Attention! Cette action est irreversible',
    confirmDeleteBtn: 'Confirmer suppression',
    addressPlaceholder: 'Rue exemple, ville',
    welcomePlaceholder: 'Bienvenue dans notre cafe',
    currencyPlaceholder: 'TND',
    editProductTitle: 'Modifier le produit',
    addProductTitle: 'Ajouter un produit',
    productNameArLabel: 'Nom du produit (Arabe)',
    productNameEnLabel: 'Nom du produit (Anglais)',
    priceLabel: 'Prix',
    categoryLabel: 'Categorie',
    chooseCategory: 'Choisir une categorie',
    imageUrlLabel: 'URL de l\'image',
    availableLabel: 'Disponible',
    saveChanges: 'Enregistrer les modifications',
    addProductAction: 'Ajouter le produit',
    editCategoryTitle: 'Modifier la categorie',
    addCategoryTitle: 'Ajouter une categorie',
    categoryNameArLabel: 'Nom de categorie (Arabe)',
    categoryNameEnLabel: 'Nom de categorie (Anglais)',
    addCategoryAction: 'Ajouter la categorie',
    editTableTitle: 'Modifier la table',
    addTableTitle: 'Ajouter une table',
    seatsLabel: 'Nombre de places',
    save: 'Enregistrer',
    actionDelete: 'Supprimer',
    adminAccountSection: 'Compte admin',
    adminAccountDesc: 'Mettre a jour email et mot de passe admin',
    adminEmailLabel: 'Email admin',
    newPasswordLabel: 'Nouveau mot de passe',
    newPasswordPlaceholder: 'Laisser vide pour conserver le mot de passe actuel',
    adminAccountSave: 'Mettre a jour le compte admin',
    adminAccountUpdatedMsg: 'Compte admin mis a jour',
    adminAccountUpdateFailedMsg: 'Echec de mise a jour du compte admin',
    driveLinkBtn: 'Lien Google Drive',
    driveLinkPrompt: 'Collez un lien Google Drive partage',
    invalidDriveLinkMsg: 'Lien Google Drive invalide',
    imageUploadFailedMsg: 'Echec du chargement de l\'image',
    imageUploadSuccessMsg: 'Image mise a jour',
    imageLinkSetMsg: 'Lien image enregistre',
    imageLinkInvalidMsg: 'Veuillez saisir un lien valide commençant par http',
    imageLinkUnreachableMsg: 'Lien image inaccessible',
  },
};

const ORDER_STATUS_LABELS: Record<AppLanguage, Record<OrderStatus, string>> = {
  ar: ORDER_STATUS_AR,
  en: {
    NEW: 'New',
    ACCEPTED: 'Accepted',
    PREPARING: 'Preparing',
    READY: 'Ready',
    SERVED: 'Served',
    PAID: 'Paid',
    CANCELLED: 'Cancelled',
  },
  fr: {
    NEW: 'Nouvelle',
    ACCEPTED: 'Acceptee',
    PREPARING: 'Preparation',
    READY: 'Prete',
    SERVED: 'Servie',
    PAID: 'Payee',
    CANCELLED: 'Annulee',
  },
};

const STATUS_ACTION_LABELS: Record<AppLanguage, Record<'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED', string>> = {
  ar: {
    NEW: 'قبول الطلب',
    ACCEPTED: 'بدء التحضير',
    PREPARING: 'تم التحضير',
    READY: 'تم التقديم',
    SERVED: 'تم الدفع',
  },
  en: {
    NEW: 'Accept order',
    ACCEPTED: 'Start preparation',
    PREPARING: 'Prepared',
    READY: 'Served',
    SERVED: 'Paid',
  },
  fr: {
    NEW: 'Accepter commande',
    ACCEPTED: 'Demarrer preparation',
    PREPARING: 'Preparation terminee',
    READY: 'Servie',
    SERVED: 'Payee',
  },
};

const LOCALE_BY_LANGUAGE: Record<AppLanguage, string> = {
  ar: 'ar-SA',
  en: 'en-US',
  fr: 'fr-FR',
};

// Sound notification
const playNotificationSound = () => {
  if (typeof window !== 'undefined') {
    const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }
};

// Ready notification sound - celebratory sound for order ready
const playReadySound = () => {
  if (typeof window !== 'undefined') {
    const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Create multiple oscillators for a pleasant chime
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    // Play a pleasant ascending arpeggio
    playTone(523.25, now, 0.15);      // C5
    playTone(659.25, now + 0.15, 0.15); // E5
    playTone(783.99, now + 0.3, 0.15);  // G5
    playTone(1046.5, now + 0.45, 0.3);  // C6 (higher)
  }
};

// Status actions configuration
const STATUS_ACTIONS: Record<OrderStatus, { next: OrderStatus; icon: typeof Check } | null> = {
  NEW: { next: 'ACCEPTED', icon: Check },
  ACCEPTED: { next: 'PREPARING', icon: ChefHat },
  PREPARING: { next: 'READY', icon: PackageCheck },
  READY: { next: 'SERVED', icon: HandPlatter },
  SERVED: { next: 'PAID', icon: CreditCard },
  PAID: null,
  CANCELLED: null
};

// Status badge classes
const STATUS_CLASSES: Record<OrderStatus, string> = {
  NEW: 'order-status-new',
  ACCEPTED: 'order-status-accepted',
  PREPARING: 'order-status-preparing',
  READY: 'order-status-ready',
  SERVED: 'order-status-served',
  PAID: 'order-status-paid',
  CANCELLED: 'order-status-cancelled'
};

// Customer tabs
type CustomerTab = 'home' | 'cart' | 'track' | 'more';
// Admin tabs
type AdminTab = 'dashboard' | 'orders' | 'menu' | 'database' | 'settings';

const DEFAULT_THEME_COLORS = {
  primaryColor: '#6F4E37',
  accentColor: '#D4A574',
  backgroundColor: '#FDF8F3',
  surfaceColor: '#FFFFFF',
  textPrimaryColor: '#3D2314',
};

type ThemePresetMode = 'light' | 'dark';

type ThemePreset = {
  id: string;
  name: string;
  description: string;
  mode: ThemePresetMode;
  colors: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textPrimaryColor: string;
  };
};

type TableStatusItem = {
  id: string;
  isOccupied: boolean;
};

type TableWithOccupancy = Table & {
  isOccupied?: boolean;
};

type AuthCheckResponse = {
  authenticated: boolean;
};

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'coffee-classic',
    name: 'قهوة كلاسيك',
    description: 'دافئ واحترافي للمقاهي',
    mode: 'light',
    colors: {
      primaryColor: '#6F4E37',
      accentColor: '#D4A574',
      backgroundColor: '#FDF8F3',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#3D2314',
    },
  },
  {
    id: 'espresso-dark',
    name: 'إسبريسو داكن',
    description: 'طابع قوي ولمسة فاخرة',
    mode: 'light',
    colors: {
      primaryColor: '#3B2A24',
      accentColor: '#B88A5A',
      backgroundColor: '#F7F2ED',
      surfaceColor: '#FFFDFC',
      textPrimaryColor: '#231611',
    },
  },
  {
    id: 'latte-cream',
    name: 'لاتيه كريمي',
    description: 'ألوان ناعمة ومريحة للقراءة',
    mode: 'light',
    colors: {
      primaryColor: '#8A6C55',
      accentColor: '#D9B38C',
      backgroundColor: '#FFF9F3',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#3D2C20',
    },
  },
  {
    id: 'mocha-bronze',
    name: 'موكا برونزي',
    description: 'مزيج دافئ بطابع عصري',
    mode: 'light',
    colors: {
      primaryColor: '#704C3A',
      accentColor: '#C98B63',
      backgroundColor: '#FBF5F1',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#352117',
    },
  },
  {
    id: 'emerald-fresh',
    name: 'زمردي منعش',
    description: 'إحساس عصري وحيوي',
    mode: 'light',
    colors: {
      primaryColor: '#1F7A5A',
      accentColor: '#48BFA3',
      backgroundColor: '#F2FBF8',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#123B2E',
    },
  },
  {
    id: 'mint-breeze',
    name: 'نسيم النعناع',
    description: 'خيار خفيف وطبيعي',
    mode: 'light',
    colors: {
      primaryColor: '#2F8F77',
      accentColor: '#6FD0BA',
      backgroundColor: '#F3FCF9',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#164437',
    },
  },
  {
    id: 'midnight-lounge',
    name: 'ليلي أنيق',
    description: 'ستايل فاخر للمقاهي الراقية',
    mode: 'light',
    colors: {
      primaryColor: '#243447',
      accentColor: '#C9A227',
      backgroundColor: '#F4F7FA',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#182430',
    },
  },
  {
    id: 'royal-blue',
    name: 'أزرق ملكي',
    description: 'مظهر رسمي وواثق',
    mode: 'light',
    colors: {
      primaryColor: '#2E4F9B',
      accentColor: '#7FA2FF',
      backgroundColor: '#F4F7FF',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#16264A',
    },
  },
  {
    id: 'charcoal-modern',
    name: 'فحمي حديث',
    description: 'تجربة احترافية نظيفة',
    mode: 'light',
    colors: {
      primaryColor: '#2E2E32',
      accentColor: '#8F97A3',
      backgroundColor: '#F5F6F8',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#1D1D20',
    },
  },
  {
    id: 'sunset-vibe',
    name: 'غروب دافئ',
    description: 'ألوان ناعمة ومبهجة',
    mode: 'light',
    colors: {
      primaryColor: '#B55239',
      accentColor: '#F3A357',
      backgroundColor: '#FFF7F1',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#4B241A',
    },
  },
  {
    id: 'berry-bloom',
    name: 'توت مزهر',
    description: 'ستايل مرح ومختلف',
    mode: 'light',
    colors: {
      primaryColor: '#8B2E5D',
      accentColor: '#E08DB4',
      backgroundColor: '#FFF4F8',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#4A1632',
    },
  },
  {
    id: 'amber-market',
    name: 'سوق كهرماني',
    description: 'دفء واضح مع تباين ممتاز',
    mode: 'light',
    colors: {
      primaryColor: '#9A4E1D',
      accentColor: '#F2A65A',
      backgroundColor: '#FFF7EE',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#4C260F',
    },
  },
  {
    id: 'olive-garden',
    name: 'حديقة زيتونية',
    description: 'هوية هادئة بطابع طبيعي',
    mode: 'light',
    colors: {
      primaryColor: '#586C3D',
      accentColor: '#A9C67A',
      backgroundColor: '#F8FBF2',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#2F3A20',
    },
  },
  {
    id: 'desert-sand',
    name: 'رمال الصحراء',
    description: 'ألوان عربية كلاسيكية عصرية',
    mode: 'light',
    colors: {
      primaryColor: '#A86E3B',
      accentColor: '#E5B97A',
      backgroundColor: '#FFF8F0',
      surfaceColor: '#FFFFFF',
      textPrimaryColor: '#4B2D16',
    },
  },
  {
    id: 'night-roast',
    name: 'حمصة ليلية',
    description: 'داكن مريح للعين في الليل',
    mode: 'dark',
    colors: {
      primaryColor: '#7D5A42',
      accentColor: '#C49A6C',
      backgroundColor: '#15110E',
      surfaceColor: '#1F1813',
      textPrimaryColor: '#F2E8DF',
    },
  },
  {
    id: 'deep-ocean-dark',
    name: 'محيط عميق',
    description: 'ألوان باردة وتباين مريح',
    mode: 'dark',
    colors: {
      primaryColor: '#3C5A8B',
      accentColor: '#6FA8FF',
      backgroundColor: '#0F1620',
      surfaceColor: '#192330',
      textPrimaryColor: '#E9F0FF',
    },
  },
  {
    id: 'forest-night',
    name: 'غابة ليلية',
    description: 'داكن طبيعي بإضاءة منخفضة',
    mode: 'dark',
    colors: {
      primaryColor: '#3A6B58',
      accentColor: '#5DBA9A',
      backgroundColor: '#0F1814',
      surfaceColor: '#16231D',
      textPrimaryColor: '#E5F5EE',
    },
  },
  {
    id: 'plum-night',
    name: 'برقوق ليلي',
    description: 'هوية فاخرة مع راحة بصرية',
    mode: 'dark',
    colors: {
      primaryColor: '#6A4C7A',
      accentColor: '#B087C8',
      backgroundColor: '#14101A',
      surfaceColor: '#1D1626',
      textPrimaryColor: '#F1E8FA',
    },
  },
];

const COLOR_MENU_OPTIONS = [
  { id: 'coffee', value: '#6F4E37' },
  { id: 'gold', value: '#C9A227' },
  { id: 'amber', value: '#D4A574' },
  { id: 'green', value: '#1F7A5A' },
  { id: 'turquoise', value: '#2D9C95' },
  { id: 'navy', value: '#243447' },
  { id: 'royalBlue', value: '#365DA8' },
  { id: 'darkPurple', value: '#52407A' },
  { id: 'burgundy', value: '#8B2E3D' },
  { id: 'charcoalGray', value: '#2E2E32' },
  { id: 'white', value: '#FFFFFF' },
  { id: 'cream', value: '#FDF8F3' },
];

const COLOR_MENU_LABELS: Record<AppLanguage, Record<string, string>> = {
  ar: {
    coffee: 'قهوة',
    gold: 'ذهبي',
    amber: 'كهرماني',
    green: 'أخضر',
    turquoise: 'فيروزي',
    navy: 'كحلي',
    royalBlue: 'أزرق ملكي',
    darkPurple: 'بنفسجي غامق',
    burgundy: 'أحمر نبيذي',
    charcoalGray: 'رمادي فحمي',
    white: 'أبيض',
    cream: 'كريمي',
  },
  en: {
    coffee: 'Coffee',
    gold: 'Gold',
    amber: 'Amber',
    green: 'Green',
    turquoise: 'Turquoise',
    navy: 'Navy',
    royalBlue: 'Royal Blue',
    darkPurple: 'Dark Purple',
    burgundy: 'Burgundy',
    charcoalGray: 'Charcoal Gray',
    white: 'White',
    cream: 'Cream',
  },
  fr: {
    coffee: 'Cafe',
    gold: 'Or',
    amber: 'Ambre',
    green: 'Vert',
    turquoise: 'Turquoise',
    navy: 'Bleu marine',
    royalBlue: 'Bleu royal',
    darkPurple: 'Violet fonce',
    burgundy: 'Bordeaux',
    charcoalGray: 'Gris anthracite',
    white: 'Blanc',
    cream: 'Creme',
  },
};

const THEME_PRESET_I18N: Record<AppLanguage, Record<string, { name: string; description: string }>> = {
  ar: {},
  en: {
    'coffee-classic': { name: 'Coffee Classic', description: 'Warm and professional for cafes' },
    'espresso-dark': { name: 'Dark Espresso', description: 'Strong identity with a premium touch' },
    'latte-cream': { name: 'Latte Cream', description: 'Soft colors and comfortable reading' },
    'mocha-bronze': { name: 'Mocha Bronze', description: 'Warm modern blend' },
    'emerald-fresh': { name: 'Fresh Emerald', description: 'Modern and lively vibe' },
    'mint-breeze': { name: 'Mint Breeze', description: 'Light natural option' },
    'midnight-lounge': { name: 'Midnight Lounge', description: 'Premium style for upscale cafes' },
    'royal-blue': { name: 'Royal Blue', description: 'Formal and confident look' },
    'charcoal-modern': { name: 'Modern Charcoal', description: 'Clean professional experience' },
    'sunset-vibe': { name: 'Warm Sunset', description: 'Soft and cheerful colors' },
    'berry-bloom': { name: 'Berry Bloom', description: 'Playful and unique style' },
    'amber-market': { name: 'Amber Market', description: 'Warm palette with strong contrast' },
    'olive-garden': { name: 'Olive Garden', description: 'Calm natural identity' },
    'desert-sand': { name: 'Desert Sand', description: 'Classic modern Arab palette' },
    'night-roast': { name: 'Night Roast', description: 'Comfortable dark for night usage' },
    'deep-ocean-dark': { name: 'Deep Ocean', description: 'Cool tones with comfortable contrast' },
    'forest-night': { name: 'Forest Night', description: 'Natural dark with low brightness' },
    'plum-night': { name: 'Night Plum', description: 'Luxurious identity with visual comfort' },
  },
  fr: {
    'coffee-classic': { name: 'Cafe Classique', description: 'Chaud et professionnel pour les cafes' },
    'espresso-dark': { name: 'Espresso Sombre', description: 'Style fort avec une touche premium' },
    'latte-cream': { name: 'Latte Creme', description: 'Couleurs douces et lecture confortable' },
    'mocha-bronze': { name: 'Mocha Bronze', description: 'Melange chaleureux et moderne' },
    'emerald-fresh': { name: 'Emeraude Fraiche', description: 'Ambiance moderne et vivante' },
    'mint-breeze': { name: 'Brise Menthe', description: 'Option legere et naturelle' },
    'midnight-lounge': { name: 'Salon Minuit', description: 'Style premium pour cafes haut de gamme' },
    'royal-blue': { name: 'Bleu Royal', description: 'Apparence formelle et confiante' },
    'charcoal-modern': { name: 'Anthracite Moderne', description: 'Experience professionnelle epuree' },
    'sunset-vibe': { name: 'Coucher Chaleureux', description: 'Couleurs douces et joyeuses' },
    'berry-bloom': { name: 'Baies Fleuries', description: 'Style ludique et different' },
    'amber-market': { name: 'Marche Ambre', description: 'Palette chaude avec fort contraste' },
    'olive-garden': { name: 'Jardin Olive', description: 'Identite naturelle et apaisante' },
    'desert-sand': { name: 'Sable du Desert', description: 'Palette arabe classique et moderne' },
    'night-roast': { name: 'Torréfaction Nuit', description: 'Sombre confortable pour la nuit' },
    'deep-ocean-dark': { name: 'Ocean Profond', description: 'Tons froids et contraste agreable' },
    'forest-night': { name: 'Foret Nocturne', description: 'Sombre naturel a faible luminosite' },
    'plum-night': { name: 'Prune Nocturne', description: 'Identite luxueuse et confort visuel' },
  },
};

const normalizeHex = (value: string) => {
  const hex = value.trim();
  const match = /^#([\da-fA-F]{6})$/.exec(hex);
  return match ? `#${match[1].toUpperCase()}` : null;
};

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const raw = normalized.slice(1);
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mixHex = (base: string, other: string, ratio: number) => {
  const a = hexToRgb(base);
  const b = hexToRgb(other);
  if (!a || !b) return base;
  const clamped = Math.max(0, Math.min(1, ratio));
  return rgbToHex(
    a.r * (1 - clamped) + b.r * clamped,
    a.g * (1 - clamped) + b.g * clamped,
    a.b * (1 - clamped) + b.b * clamped
  );
};

const getContrastText = (background: string) => {
  const rgb = hexToRgb(background);
  if (!rgb) return '#1F1F1F';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.62 ? '#1F1F1F' : '#FFFFFF';
};

const buildThemeSuggestions = (primaryColor: string) => {
  const primary = normalizeHex(primaryColor) || DEFAULT_THEME_COLORS.primaryColor;
  return [
    {
      id: 'balanced',
      labelKey: 'themeBalanced',
      hintKey: 'themeBalancedHint',
      colors: {
        primaryColor: primary,
        accentColor: mixHex(primary, '#FFFFFF', 0.4),
        backgroundColor: mixHex(primary, '#FFFFFF', 0.9),
        surfaceColor: '#FFFFFF',
        textPrimaryColor: mixHex(primary, '#000000', 0.55),
      },
    },
    {
      id: 'bold',
      labelKey: 'themeBold',
      hintKey: 'themeBoldHint',
      colors: {
        primaryColor: primary,
        accentColor: mixHex(primary, '#FFD166', 0.55),
        backgroundColor: mixHex(primary, '#FFFFFF', 0.84),
        surfaceColor: mixHex(primary, '#FFFFFF', 0.96),
        textPrimaryColor: mixHex(primary, '#000000', 0.65),
      },
    },
    {
      id: 'soft',
      labelKey: 'themeSoft',
      hintKey: 'themeSoftHint',
      colors: {
        primaryColor: primary,
        accentColor: mixHex(primary, '#A8DADC', 0.45),
        backgroundColor: mixHex(primary, '#FFFFFF', 0.93),
        surfaceColor: mixHex(primary, '#FFFFFF', 0.985),
        textPrimaryColor: mixHex(primary, '#000000', 0.48),
      },
    },
  ];
};

export default function CafeApp() {

  // Settings State
  const [settings, setSettings] = useState<Settings | null>(null);
  
  // Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Navigation State
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<Reports | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Order State
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  
  // Admin states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('today');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all');
  const [adminAccountForm, setAdminAccountForm] = useState({ email: '', password: '' });
  const [isAdminAccountLoading, setIsAdminAccountLoading] = useState(false);
  
  // Database management states
  const [dbStats, setDbStats] = useState<{orders: number, products: number, categories: number, tables: number, admins: number, oldestOrder: string | null} | null>(null);
  const [deleteOlderThan, setDeleteOlderThan] = useState(30);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(false);
  
  // Submit protection
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const customerPollingRef = useRef<NodeJS.Timeout | null>(null);
  const tablePollingRef = useRef<NodeJS.Timeout | null>(null);
  const prevOrdersCountRef = useRef<number>(0);
  const isFetchingOrdersRef = useRef(false);
  const isFetchingTrackedOrderRef = useRef(false);
  const isFetchingTableStatusRef = useRef(false);
  
  // Order tracking states for customer
  const [trackingCode, setTrackingCode] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [lastOrderCode, setLastOrderCode] = useState<string | null>(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [prevTrackedStatus, setPrevTrackedStatus] = useState<OrderStatus | null>(null);
  
  // Table status states
  const [occupiedTables, setOccupiedTables] = useState<Set<string>>(new Set());
  const [isLoadingTablesStatus, setIsLoadingTablesStatus] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(() => {
    if (typeof document === 'undefined') return true;
    return document.visibilityState === 'visible';
  });
  
  // Form states
  const [productForm, setProductForm] = useState({
    name: '', nameAr: '', description: '', descriptionAr: '',
    price: '', image: '', categoryId: '', available: true
  });
  
  const [categoryForm, setCategoryForm] = useState({ name: '', nameAr: '', image: '' });
  const [tableForm, setTableForm] = useState({ number: '', seats: '4', description: '' });
  const [appLanguage, setAppLanguage] = useState<AppLanguage>(
    () => (typeof window !== 'undefined' ? (resolveLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY)) || 'ar') : 'ar')
  );
  const [settingsForm, setSettingsForm] = useState({ 
    cafeName: '', 
    language: typeof window !== 'undefined' ? (resolveLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY)) || 'ar') : ('ar' as AppLanguage),
    currency: 'TND',
    logo: '',
    primaryColor: DEFAULT_THEME_COLORS.primaryColor,
    accentColor: DEFAULT_THEME_COLORS.accentColor,
    backgroundColor: DEFAULT_THEME_COLORS.backgroundColor,
    surfaceColor: DEFAULT_THEME_COLORS.surfaceColor,
    textPrimaryColor: DEFAULT_THEME_COLORS.textPrimaryColor,
    openingHours: '08:00',
    closingHours: '23:00',
    phone: '',
    address: '',
    welcomeMessage: '',
    acceptOrders: true,
    enableTableService: true,
    enableDelivery: false
  });

  const applyThemeColors = useCallback((colors?: {
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    surfaceColor?: string;
    textPrimaryColor?: string;
  }) => {
    if (typeof document === 'undefined') return;

    const rootStyle = document.documentElement.style;

    const primary = colors?.primaryColor || DEFAULT_THEME_COLORS.primaryColor;
    const accent = colors?.accentColor || DEFAULT_THEME_COLORS.accentColor;
    const background = colors?.backgroundColor || DEFAULT_THEME_COLORS.backgroundColor;
    const surface = colors?.surfaceColor || DEFAULT_THEME_COLORS.surfaceColor;
    const textPrimary = colors?.textPrimaryColor || DEFAULT_THEME_COLORS.textPrimaryColor;
    const primaryHover = mixHex(primary, '#000000', 0.16);
    const primaryLight = mixHex(primary, '#FFFFFF', 0.84);
    const primaryDark = mixHex(primary, '#000000', 0.34);
    const accentHover = mixHex(accent, '#000000', 0.14);
    const accentLight = mixHex(accent, '#FFFFFF', 0.88);
    const surfaceRaised = mixHex(surface, background, 0.25);
    const border = mixHex(surface, textPrimary, 0.16);
    const textSecondary = mixHex(textPrimary, background, 0.38);
    const textMuted = mixHex(textPrimary, background, 0.55);

    rootStyle.setProperty('--primary', primary);
    rootStyle.setProperty('--primary-hover', primaryHover);
    rootStyle.setProperty('--primary-light', primaryLight);
    rootStyle.setProperty('--primary-dark', primaryDark);
    rootStyle.setProperty('--accent', accent);
    rootStyle.setProperty('--accent-hover', accentHover);
    rootStyle.setProperty('--accent-light', accentLight);
    rootStyle.setProperty('--background', background);
    rootStyle.setProperty('--surface', surface);
    rootStyle.setProperty('--surface-raised', surfaceRaised);
    rootStyle.setProperty('--border', border);
    rootStyle.setProperty('--text-primary', textPrimary);
    rootStyle.setProperty('--text-secondary', textSecondary);
    rootStyle.setProperty('--text-muted', textMuted);
    rootStyle.setProperty('--gradient-primary', `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`);
    rootStyle.setProperty('--gradient-cream', `linear-gradient(180deg, ${background} 0%, ${surfaceRaised} 100%)`);
  }, []);

  const themeSuggestions = useMemo(
    () => buildThemeSuggestions(settingsForm.primaryColor),
    [settingsForm.primaryColor]
  );

  const recommendedThemePresets = useMemo(() => THEME_PRESETS, []);

  const updateThemeColor = (
    key: 'primaryColor' | 'accentColor' | 'backgroundColor' | 'surfaceColor' | 'textPrimaryColor',
    value: string,
    allowInvalidHex: boolean = false
  ) => {
    const nextValue = allowInvalidHex ? value : normalizeHex(value);
    if (!nextValue) return;

    const nextForm = { ...settingsForm, [key]: nextValue };
    setSettingsForm(nextForm);
    applyThemeColors(nextForm);
  };

  const applyThemePack = (colors: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textPrimaryColor: string;
  }) => {
    const nextForm = { ...settingsForm, ...colors };
    setSettingsForm(nextForm);
    applyThemeColors(nextForm);
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch initial data
  useEffect(() => {
    applyThemeColors();
    fetchAllData();
  }, [applyThemeColors]);

  // Realtime polling for admin - always poll when authenticated
  useEffect(() => {
    if (isAdminAuthenticated && isPageVisible) {
      fetchOrders();
      pollingRef.current = setInterval(() => {
        fetchOrders();
      }, ADMIN_ORDERS_POLL_INTERVAL_MS);
    }
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isAdminAuthenticated, isPageVisible]);
  
  // Realtime polling for customer tracking
  useEffect(() => {
    if (customerTab === 'track' && trackedOrder && isPageVisible) {
      refreshTrackedOrder();
      customerPollingRef.current = setInterval(() => {
        refreshTrackedOrder();
      }, TRACKING_POLL_INTERVAL_MS);
    }
    
    return () => {
      if (customerPollingRef.current) {
        clearInterval(customerPollingRef.current);
      }
    };
  }, [customerTab, trackedOrder, isPageVisible]);

  // Fetch table status (occupied/available)
  const fetchTablesStatus = useCallback(async () => {
    if (isFetchingTableStatusRef.current) return;

    isFetchingTableStatusRef.current = true;
    try {
      const res = await fetch('/api/tables/status', { 
        cache: 'no-store'
      });
      if (!res.ok) {
        console.error('fetchTablesStatus HTTP error:', res.status);
        return;
      }
      const data = (await res.json()) as TableStatusItem[];
      
      if (Array.isArray(data)) {
        const occupied = new Set(data.filter(t => t.isOccupied).map(t => t.id));
        setOccupiedTables(occupied);
      }
    } catch (error) {
      console.error('fetchTablesStatus error:', error);
    } finally {
      isFetchingTableStatusRef.current = false;
    }
  }, []);

  // Realtime polling for table status (always poll for customers)
  useEffect(() => {
    if (isAdminAuthenticated || !isPageVisible || !showOrderDialog) return;

    fetchTablesStatus();

    tablePollingRef.current = setInterval(() => {
      fetchTablesStatus();
    }, TABLE_STATUS_POLL_INTERVAL_MS);
    
    return () => {
      if (tablePollingRef.current) {
        clearInterval(tablePollingRef.current);
      }
    };
  }, [fetchTablesStatus, isAdminAuthenticated, isPageVisible, showOrderDialog]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Sound notification for new orders
  useEffect(() => {
    if (isAdminAuthenticated && orders.length > prevOrdersCountRef.current && soundEnabled) {
      const newOrders = orders.filter(o => o.status === 'NEW');
      if (newOrders.length > 0) {
        playNotificationSound();
        toast({ 
          title: t('newOrderAlertTitle'),
          description: `${t('newOrderAlertDesc')} ${newOrders.length} ${t('newOrderCountSuffix')}`
        });
      }
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders, isAdminAuthenticated, soundEnabled]);

  // Sound notification for READY status in customer tracking
  useEffect(() => {
    if (trackedOrder && prevTrackedStatus && trackedOrder.status === 'READY' && prevTrackedStatus !== 'READY') {
      playReadySound();
      toast({ 
        title: t('readyOrderAlertTitle'),
        description: t('readyOrderAlertDesc')
      });
    }
    if (trackedOrder) {
      setPrevTrackedStatus(trackedOrder.status);
    }
  }, [trackedOrder?.status]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check', { 
        cache: 'no-store',
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Auth check failed: ${res.status}`);
      const data = (await res.json()) as AuthCheckResponse;
      setIsAdminAuthenticated(Boolean(data.authenticated));
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAdminAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const requests: Promise<unknown>[] = [
        fetchSettings(),
        fetchCategories(),
        fetchProducts(),
        fetchTables(),
      ];

      if (isAdminAuthenticated) {
        requests.push(fetchOrders());
      }

      await Promise.allSettled(requests);
    } catch (error) {
      console.error('fetchAllData error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const storedLanguage = typeof window !== 'undefined' ? localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;
      const languageFromSettings = resolveLanguage(data.language);
      const languageFromStorage = resolveLanguage(storedLanguage);
      const effectiveLanguage = languageFromSettings || languageFromStorage || 'ar';

      setSettings(data);
      setAppLanguage(effectiveLanguage);
      setSettingsForm({ 
        cafeName: data.cafeName, 
        language: effectiveLanguage,
        currency: data.currency,
        logo: data.logo || '',
        primaryColor: data.primaryColor || DEFAULT_THEME_COLORS.primaryColor,
        accentColor: data.accentColor || DEFAULT_THEME_COLORS.accentColor,
        backgroundColor: data.backgroundColor || DEFAULT_THEME_COLORS.backgroundColor,
        surfaceColor: data.surfaceColor || DEFAULT_THEME_COLORS.surfaceColor,
        textPrimaryColor: data.textPrimaryColor || DEFAULT_THEME_COLORS.textPrimaryColor,
        openingHours: data.openingHours || '08:00',
        closingHours: data.closingHours || '23:00',
        phone: data.phone || '',
        address: data.address || '',
        welcomeMessage: data.welcomeMessage || '',
        acceptOrders: data.acceptOrders ?? true,
        enableTableService: data.enableTableService ?? true,
        enableDelivery: data.enableDelivery ?? false
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, effectiveLanguage);
      }
      applyThemeColors({
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        backgroundColor: data.backgroundColor,
        surfaceColor: data.surfaceColor,
        textPrimaryColor: data.textPrimaryColor,
      });
    } catch (error) {
      console.error('fetchSettings error:', error);
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('fetchCategories error:', error);
      throw error;
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('fetchProducts error:', error);
      throw error;
    }
  };

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables', { 
        cache: 'no-store',
        credentials: 'include'
      });
      if (!res.ok) {
        console.error('fetchTables HTTP error:', res.status);
        setTables([]);
        return;
      }
      const data = (await res.json()) as TableWithOccupancy[];
      
      if (Array.isArray(data)) {
        setTables(data);
        // Update occupiedTables from isOccupied
        const occupied = new Set(data.filter(t => t.isOccupied).map(t => t.id));
        setOccupiedTables(occupied);
      } else {
        setTables([]);
      }
    } catch (error) {
      console.error('fetchTables error:', error);
      setTables([]);
    }
  };

  const fetchOrders = async () => {
    if (isFetchingOrdersRef.current) return;

    isFetchingOrdersRef.current = true;
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('fetchOrders error:', error);
    } finally {
      isFetchingOrdersRef.current = false;
    }
  };

  const fetchReports = async (period: string = 'today') => {
    try {
      const res = await fetch(`/api/reports?period=${period}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error('fetchReports error:', error);
    }
  };

  const getDriveFileId = (value: string) => {
    try {
      const url = new URL(value);
      const searchId = url.searchParams.get('id');
      if (searchId) return searchId;

      const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
      if (fileMatch?.[1]) return fileMatch[1];

      const ucMatch = url.pathname.match(/\/uc/);
      if (ucMatch && url.searchParams.get('export') && url.searchParams.get('id')) {
        return url.searchParams.get('id');
      }
    } catch {
      return null;
    }

    return null;
  };

  const normalizeDriveImageUrl = (value: string) => {
    const fileId = getDriveFileId(value);
    if (!fileId) return null;
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  };

  const normalizeImageUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const driveUrl = normalizeDriveImageUrl(trimmed);
    if (driveUrl) return driveUrl;
    return trimmed;
  };

  const validateImageUrl = async (value: string) => {
    const normalized = normalizeImageUrl(value);
    if (!normalized) return '';
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      toast({ title: t('warningTitle'), description: t('imageLinkInvalidMsg'), variant: 'destructive' });
      return '';
    }

    if (typeof window !== 'undefined') {
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          const timer = window.setTimeout(() => {
            img.src = '';
            reject(new Error('timeout'));
          }, 8000);
          img.onload = () => {
            window.clearTimeout(timer);
            resolve();
          };
          img.onerror = () => {
            window.clearTimeout(timer);
            reject(new Error('invalid'));
          };
          img.src = normalized;
        });
      } catch {
        toast({ title: t('warningTitle'), description: t('imageLinkUnreachableMsg'), variant: 'destructive' });
        return '';
      }
    }

    toast({ title: '✅', description: t('imageLinkSetMsg') });
    return normalized;
  };

  const handleDriveLink = async (onChange: (url: string) => void) => {
    if (typeof window === 'undefined') return;
    const link = window.prompt(t('driveLinkPrompt'))?.trim();
    if (!link) return;
    const normalized = normalizeDriveImageUrl(link);
    if (!normalized) {
      toast({ title: t('warningTitle'), description: t('invalidDriveLinkMsg'), variant: 'destructive' });
      return;
    }
    onChange(normalized);
    toast({ title: '✅', description: t('imageLinkSetMsg') });
  };

  const fetchAdminAccount = async () => {
    try {
      const res = await fetch('/api/admin/account', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.admin?.email) {
        setAdminAccountForm((prev) => ({ ...prev, email: data.admin.email }));
      }
    } catch (error) {
      console.error('Fetch admin account error:', error);
    }
  };

  const saveAdminAccount = async () => {
    if (!adminAccountForm.email.trim()) {
      toast({ title: t('warningTitle'), description: t('adminEmailLabel'), variant: 'destructive' });
      return;
    }

    try {
      setIsAdminAccountLoading(true);
      const res = await fetch('/api/admin/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminAccountForm.email.trim(),
          password: adminAccountForm.password.trim() || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAdminAccountForm({ email: data?.admin?.email || adminAccountForm.email, password: '' });
        toast({ title: '✅', description: t('adminAccountUpdatedMsg') });
      } else {
        const errorData = await res.json();
        toast({ title: t('genericErrorTitle'), description: errorData.error || t('adminAccountUpdateFailedMsg'), variant: 'destructive' });
      }
    } catch (error) {
      console.error('Update admin account error:', error);
      toast({ title: t('genericErrorTitle'), description: t('adminAccountUpdateFailedMsg'), variant: 'destructive' });
    } finally {
      setIsAdminAccountLoading(false);
    }
  };

  // Auth functions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsAdminAuthenticated(true);
        setShowLoginDialog(false);
        setLoginForm({ email: '', password: '' });
        toast({ title: t('loginSuccessTitle'), description: t('loginSuccessDesc') });
      } else {
        toast({ title: t('loginErrorTitle'), description: data.error || t('loginErrorDesc'), variant: 'destructive' });
      }
    } catch {
      toast({ title: t('loginErrorTitle'), description: t('loginErrorDesc'), variant: 'destructive' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAdminAuthenticated(false);
      toast({ title: t('logoutSuccessTitle'), description: t('logoutSuccessDesc') });
    } catch {
      toast({ title: t('genericErrorTitle'), description: t('logout'), variant: 'destructive' });
    }
  };

  // Quick Order System
  const addProductToCart = (productId: string) => {
    const newSelection = new Map(selectedProducts);
    const current = newSelection.get(productId) || 0;
    newSelection.set(productId, current + 1);
    setSelectedProducts(newSelection);
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    const newSelection = new Map(selectedProducts);
    if (quantity <= 0) {
      newSelection.delete(productId);
    } else {
      newSelection.set(productId, quantity);
    }
    setSelectedProducts(newSelection);
  };

  const getSelectedProductsList = () => {
    const items: { product: Product; quantity: number }[] = [];
    selectedProducts.forEach((quantity, productId) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        items.push({ product, quantity });
      }
    });
    return items;
  };

  const getOrderTotal = () => {
    let total = 0;
    selectedProducts.forEach((quantity, productId) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        total += product.price * quantity;
      }
    });
    return total;
  };

  const getCartCount = () => {
    let count = 0;
    selectedProducts.forEach((quantity) => {
      count += quantity;
    });
    return count;
  };

  // Submit order
  const submitOrder = useCallback(async () => {
    if (isSubmitting) return;
    
    if (!selectedTableId) {
      toast({ title: '⚠️', description: t('tableNumber'), variant: 'destructive' });
      return;
    }
    if (selectedProducts.size === 0) {
      toast({ title: '⚠️', description: t('noProducts'), variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const table = tables.find(t => t.id === selectedTableId);
    const items = getSelectedProductsList();
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTableId,
          tableNumber: table?.number,
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
          }))
        })
      });

      if (res.ok) {
        const orderData = await res.json();
        
        // Save order code for tracking
        setLastOrderCode(orderData.orderCode);
        setTrackedOrder(orderData);
        
        // Show success dialog with code
        setShowOrderSuccess(true);
        
        setSelectedProducts(new Map());
        setSelectedTableId('');
        setShowOrderDialog(false);
        if (isAdminAuthenticated) {
          fetchOrders();
        }
      } else if (res.status === 409) {
        // Table occupied
        const data = await res.json();
        console.error('Table occupied:', data);
        
        // Refresh table status
        fetchTablesStatus();
        
        // Close dialog and show clear message
        setShowOrderDialog(false);
        setSelectedTableId('');
        
        toast({ 
          title: '🚫', 
          description: data.details || t('blockedTablesHint'),
          variant: 'destructive'
        });
      } else {
        const data = await res.json();
        console.error('Order creation failed:', data);
        toast({ 
          title: '❌', 
          description: data.details || data.error || t('sending'), 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Submit order error:', error);
      toast({ title: '❌', description: t('sending'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, selectedTableId, selectedProducts, tables, isAdminAuthenticated]);

  // Track order by code
  const trackOrder = async (codeOrEvent?: string | React.MouseEvent<HTMLButtonElement>) => {
    const code = typeof codeOrEvent === 'string' ? codeOrEvent : trackingCode;
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      toast({ title: '⚠️', description: t('enterTrackingFirst'), variant: 'destructive' });
      return;
    }
    
    setTrackingCode(normalizedCode);
    setIsTrackingLoading(true);
    try {
      const res = await fetch(`/api/track?code=${normalizedCode}`, {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const order = await res.json();
        setTrackedOrder(order);
        toast({ title: '✅', description: `${t('orderFound')} - ${t('table')} ${order.tableNumber}` });
      } else {
        const data = await res.json();
        toast({ title: '❌', description: data.error || t('orderNotFound'), variant: 'destructive' });
        setTrackedOrder(null);
      }
    } catch {
      toast({ title: '❌', description: t('searchOrderFailed'), variant: 'destructive' });
      setTrackedOrder(null);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  // Refresh tracked order (for polling)
  const refreshTrackedOrder = async () => {
    if (!trackedOrder?.orderCode) return;
    if (isFetchingTrackedOrderRef.current) return;

    isFetchingTrackedOrderRef.current = true;
    
    try {
      const res = await fetch(`/api/track?code=${trackedOrder.orderCode}`, {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const order = await res.json();
        setTrackedOrder(order);
      }
    } catch {
      // Silent fail for polling
    } finally {
      isFetchingTrackedOrderRef.current = false;
    }
  };

  // Copy tracking code to clipboard
  const copyTrackingCode = () => {
    if (lastOrderCode) {
      navigator.clipboard.writeText(lastOrderCode);
      toast({ title: '✅', description: `${t('copyCode')}: ${lastOrderCode}` });
    }
  };

  // Go to tracking with last order code
  const goToTrackOrder = () => {
    setShowOrderSuccess(false);
    setCustomerTab('track');
    if (lastOrderCode) {
      setTrackingCode(lastOrderCode);
    }
  };

  // Order Status Update
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const previousOrder = orders.find((order) => order.id === orderId);
    const previousTrackedOrderStatus = trackedOrder?.id === orderId ? trackedOrder.status : null;

    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
    setTrackedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev));

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        toast({ title: '✅', description: t('orders') });
        if (isAdminAuthenticated) {
          fetchOrders();
        }
      } else {
        const data = await res.json();
        if (previousOrder) {
          setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: previousOrder.status } : order)));
        }
        if (previousTrackedOrderStatus) {
          setTrackedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: previousTrackedOrderStatus } : prev));
        }
        toast({ title: '❌', description: data.error || t('orders'), variant: 'destructive' });
      }
    } catch {
      if (previousOrder) {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: previousOrder.status } : order)));
      }
      if (previousTrackedOrderStatus) {
        setTrackedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: previousTrackedOrderStatus } : prev));
      }
      toast({ title: '❌', description: t('orders'), variant: 'destructive' });
    }
  };

  // Advance to next status
  const advanceOrderStatus = async (orderId: string, currentStatus: OrderStatus) => {
    const action = STATUS_ACTIONS[currentStatus];
    if (action) {
      await updateOrderStatus(orderId, action.next);
    }
  };

  // Cancel order
  const cancelOrder = async (orderId: string) => {
    if (confirm(t('orderCancelledConfirm'))) {
      await updateOrderStatus(orderId, 'CANCELLED');
    }
  };

  // Settings
  const saveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        const savedLanguage = resolveLanguage(data.language) || settingsForm.language;
        setAppLanguage(savedLanguage);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, savedLanguage);
        }
        setSettingsForm((prev) => ({ ...prev, language: savedLanguage }));
        applyThemeColors({
          primaryColor: data.primaryColor,
          accentColor: data.accentColor,
          backgroundColor: data.backgroundColor,
          surfaceColor: data.surfaceColor,
          textPrimaryColor: data.textPrimaryColor,
        });
        toast({ title: '✅', description: t('settings') });
      } else {
        const errorData = await res.json();
        toast({ title: '❌', description: errorData.error || t('settings'), variant: 'destructive' });
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast({ title: '❌', description: t('settings'), variant: 'destructive' });
    }
  };

  // Product CRUD
  const saveProduct = async () => {
    if (!productForm.name || !productForm.nameAr || !productForm.price || !productForm.categoryId) {
      toast({ title: t('warningTitle'), description: t('requiredFieldsMsg'), variant: 'destructive' });
      return;
    }
    
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          nameAr: productForm.nameAr,
          description: productForm.description,
          descriptionAr: productForm.descriptionAr,
          price: parseFloat(productForm.price),
          image: productForm.image,
          categoryId: productForm.categoryId,
          available: productForm.available
        })
      });

      if (res.ok) {
        toast({ title: '✅', description: editingProduct ? t('productUpdatedMsg') : t('productAddedMsg') });
        setIsProductDialogOpen(false);
        resetProductForm();
        fetchProducts();
      } else {
        const data = await res.json();
        toast({ title: t('genericErrorTitle'), description: data.error || t('productSaveFailedMsg'), variant: 'destructive' });
      }
    } catch (error) {
      console.error('Save product error:', error);
      toast({ title: t('genericErrorTitle'), description: t('serverConnectionFailedMsg'), variant: 'destructive' });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm(t('confirmDeleteProduct'))) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      toast({ title: t('ordersDeletedTitle'), description: t('productDeletedMsg') });
      fetchProducts();
    } catch {
      toast({ title: t('genericErrorTitle'), description: t('productDeleteFailedMsg'), variant: 'destructive' });
    }
  };

  const resetProductForm = () => {
    setProductForm({ name: '', nameAr: '', description: '', descriptionAr: '', price: '', image: '', categoryId: '', available: true });
    setEditingProduct(null);
  };

  // Category CRUD
  const saveCategory = async () => {
    if (!categoryForm.name || !categoryForm.nameAr) {
      toast({ title: t('warningTitle'), description: t('categoryNameRequiredMsg'), variant: 'destructive' });
      return;
    }
    
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          nameAr: categoryForm.nameAr,
          image: categoryForm.image
        })
      });

      if (res.ok) {
        toast({ title: '✅', description: editingCategory ? t('categoryUpdatedMsg') : t('categoryAddedMsg') });
        setIsCategoryDialogOpen(false);
        resetCategoryForm();
        fetchCategories();
      } else {
        const data = await res.json();
        toast({ title: t('genericErrorTitle'), description: data.error || t('categorySaveFailedMsg'), variant: 'destructive' });
      }
    } catch (error) {
      console.error('Save category error:', error);
      toast({ title: t('genericErrorTitle'), description: t('serverConnectionFailedMsg'), variant: 'destructive' });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm(t('confirmDeleteCategory'))) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      toast({ title: t('ordersDeletedTitle'), description: t('categoryDeletedMsg') });
      fetchCategories();
      fetchProducts();
    } catch {
      toast({ title: t('genericErrorTitle'), description: t('categoryDeleteFailedMsg'), variant: 'destructive' });
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', nameAr: '', image: '' });
    setEditingCategory(null);
  };

  // Table CRUD
  const saveTable = async () => {
    // Validation
    if (!tableForm.number || isNaN(parseInt(tableForm.number))) {
      toast({ title: t('warningTitle'), description: t('invalidTableNumberMsg'), variant: 'destructive' });
      return;
    }
    
    try {
      if (editingTable) {
        const res = await fetch(`/api/tables/${editingTable.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: parseInt(tableForm.number),
            seats: parseInt(tableForm.seats) || 4,
            description: tableForm.description || null
          })
        });
        
        if (res.ok) {
          toast({ title: '✅', description: t('tableUpdatedMsg') });
          setIsTableDialogOpen(false);
          resetTableForm();
          fetchTables();
        } else {
          const data = await res.json();
           toast({ title: t('genericErrorTitle'), description: data.error || t('tableUpdateFailedMsg'), variant: 'destructive' });
        }
      } else {
        const res = await fetch('/api/tables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: parseInt(tableForm.number),
            seats: parseInt(tableForm.seats) || 4,
            description: tableForm.description || null
          })
        });
        
        if (res.ok) {
          toast({ title: '✅', description: t('tableAddedMsg') });
          setIsTableDialogOpen(false);
          resetTableForm();
          fetchTables();
        } else {
          const data = await res.json();
          toast({ title: t('genericErrorTitle'), description: data.error || t('tableAddFailedMsg'), variant: 'destructive' });
        }
      }
    } catch (error) {
      console.error('Save table error:', error);
      toast({ title: t('genericErrorTitle'), description: t('serverConnectionFailedMsg'), variant: 'destructive' });
    }
  };

  const deleteTable = async (id: string) => {
    if (!confirm(t('confirmDeleteTable'))) return;
    try {
      await fetch(`/api/tables?id=${id}`, { method: 'DELETE' });
      toast({ title: t('ordersDeletedTitle'), description: t('tableDeletedMsg') });
      fetchTables();
    } catch {
      toast({ title: t('genericErrorTitle'), description: t('tableDeleteFailedMsg'), variant: 'destructive' });
    }
  };

  const resetTableForm = () => {
    setTableForm({ number: '', seats: '4', description: '' });
    setEditingTable(null);
  };

  // Filter products
  const filteredProducts = selectedCategory === 'all' 
    ? products.filter(p => p.available) 
    : products.filter(p => p.categoryId === selectedCategory && p.available);

  // Filter orders for admin
  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === orderFilter);

  // Fetch reports when tab changes
  useEffect(() => {
    if (adminTab === 'dashboard' && isAdminAuthenticated) {
      fetchReports(reportPeriod);
    }
  }, [adminTab, reportPeriod, isAdminAuthenticated]);

  useEffect(() => {
    if (adminTab === 'settings' && isAdminAuthenticated) {
      fetchAdminAccount();
    }
  }, [adminTab, isAdminAuthenticated]);

  // Count orders by status
  const newOrdersCount = orders.filter(o => o.status === 'NEW').length;
  const preparingOrdersCount = orders.filter(o => o.status === 'PREPARING' || o.status === 'ACCEPTED').length;
  const readyOrdersCount = orders.filter(o => o.status === 'READY').length;

  const language: AppLanguage = appLanguage;
  const t = (key: string) => UI_TEXT[language][key] || UI_TEXT.en[key] || key;
  const getStatusLabel = (status: OrderStatus) => ORDER_STATUS_LABELS[language]?.[status] || ORDER_STATUS_LABELS.en[status];
  const getStatusActionLabel = (status: OrderStatus) => {
    if (status === 'PAID' || status === 'CANCELLED') return '';
    return STATUS_ACTION_LABELS[language][status as 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED'];
  };
  const locale = LOCALE_BY_LANGUAGE[language];
  const appDir: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr';
  const getPresetText = (preset: ThemePreset) => {
    const localized = THEME_PRESET_I18N[language]?.[preset.id];
    if (localized) return localized;
    return { name: preset.name, description: preset.description };
  };
  const getColorOptionLabel = (optionId: string) =>
    COLOR_MENU_LABELS[language]?.[optionId] || COLOR_MENU_LABELS.ar[optionId] || optionId;
  const localizedCafeName = settings?.cafeName || "L'EscoBar";
  const getCategoryDisplayName = (category: Category) => {
    if (language === 'ar') return category.nameAr;
    return category.name;
  };
  const getProductDisplayName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    return product.name;
  };
  const getProductDescription = (product: Product) => {
    if (language === 'ar') return product.descriptionAr || product.description || '';
    return product.description || product.descriptionAr || '';
  };
  const getOrderItemDisplayName = (item: OrderItem) => {
    if (item.product) {
      return language === 'ar' ? item.product.nameAr : item.product.name;
    }
    return item.productName;
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;
    document.documentElement.dir = appDir;
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language, appDir]);

  const currency = settings?.currency || t('currencyPlaceholder');
  const cafeName = localizedCafeName;

  // Database Management Functions
  const fetchDbStats = async () => {
    try {
      const res = await fetch('/api/admin/database');
      if (res.ok) {
        const data = await res.json();
        setDbStats(data.stats);
      }
    } catch (error) {
      console.error('Fetch DB stats error:', error);
    }
  };

  const downloadBackup = async () => {
    try {
      setIsDbLoading(true);
      const res = await fetch('/api/admin/backup');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lescobar-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: t('backupSuccessTitle'), description: t('backupSuccessMsg') });
      } else {
        toast({ title: t('genericErrorTitle'), description: t('backupFailedMsg'), variant: 'destructive' });
      }
    } catch {
      toast({ title: t('genericErrorTitle'), description: t('backupFailedMsg'), variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  const deleteOldOrders = async () => {
    if (!confirm(`${t('confirmDeleteOldOrders')} ${deleteOlderThan} ${t('dayWord')}?`)) return;
    
    try {
      setIsDbLoading(true);
      const res = await fetch('/api/admin/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-orders',
          options: { keepDays: deleteOlderThan }
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast({ title: t('ordersDeletedTitle'), description: data.message });
        fetchDbStats();
        fetchOrders();
      } else {
        toast({ title: t('genericErrorTitle'), description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t('genericErrorTitle'), description: t('deleteOrdersFailedMsg'), variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  const deleteAllOrders = async () => {
    if (!confirm(t('confirmDeleteAllOrders'))) return;
    
    try {
      setIsDbLoading(true);
      const res = await fetch('/api/admin/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-orders',
          options: {}
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast({ title: t('ordersDeletedTitle'), description: data.message });
        fetchDbStats();
        fetchOrders();
      } else {
        toast({ title: t('genericErrorTitle'), description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t('genericErrorTitle'), description: t('deleteOrdersFailedMsg'), variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  const deleteAllProducts = async () => {
    if (!confirm(t('confirmDeleteAllProducts'))) return;
    
    try {
      setIsDbLoading(true);
      const res = await fetch('/api/admin/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-products' })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast({ title: t('ordersDeletedTitle'), description: data.message });
        fetchDbStats();
        fetchProducts();
        fetchOrders();
      } else {
        toast({ title: t('genericErrorTitle'), description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t('genericErrorTitle'), description: t('deleteProductsFailedMsg'), variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  const deleteAllCategories = async () => {
    if (!confirm(t('confirmDeleteAllCategories'))) return;
    
    try {
      setIsDbLoading(true);
      const res = await fetch('/api/admin/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-categories' })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast({ title: t('ordersDeletedTitle'), description: data.message });
        fetchDbStats();
        fetchCategories();
        fetchProducts();
        fetchOrders();
      } else {
        toast({ title: t('genericErrorTitle'), description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t('genericErrorTitle'), description: t('deleteCategoriesFailedMsg'), variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  const deleteAllTables = async () => {
    if (!confirm(t('confirmDeleteAllTables'))) return;
    
    try {
      setIsDbLoading(true);
      const res = await fetch('/api/admin/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-tables' })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast({ title: t('ordersDeletedTitle'), description: data.message });
        fetchDbStats();
        fetchTables();
        fetchOrders();
      } else {
        toast({ title: t('genericErrorTitle'), description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t('genericErrorTitle'), description: t('deleteTablesFailedMsg'), variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  const fullDatabaseReset = async () => {
    if (!confirm(t('fullResetConfirmStep1'))) return;
    if (!confirm(t('fullResetConfirmStep2'))) return;
    
    try {
      setIsDbLoading(true);
      const res = await fetch('/api/admin/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-full' })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast({ title: t('resetDoneTitle'), description: data.message });
        setShowResetConfirm(false);
        fetchDbStats();
        fetchAllData();
      } else {
        toast({ title: t('genericErrorTitle'), description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t('genericErrorTitle'), description: t('resetFailedMsg'), variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  // Fetch DB stats when database tab is active
  useEffect(() => {
    if (adminTab === 'database' && isAdminAuthenticated) {
      fetchDbStats();
    }
  }, [adminTab, isAdminAuthenticated]);

  // Loading state
  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--primary)] flex items-center justify-center">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <p className="text-[var(--text-secondary)]">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Admin View
  if (isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)]" dir={appDir}>
        {/* App Header */}
        <header className="app-header">
          <div className="app-header-inner">
            <div className="flex items-center gap-3">
              {settings?.logo ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--surface-raised)]">
                  <img src={settings.logo} alt={cafeName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[var(--gradient-primary)] flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
              )}
              <h1 className="app-title">{cafeName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="btn btn-ghost btn-icon"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="content-padded-bottom">
          {/* Dashboard Tab */}
          {adminTab === 'dashboard' && (
            <div className="p-4">
              <h2 className="text-h2 mb-4">{t('dashboard')}</h2>
              
              {/* Stats Group */}
              <div className="stats-group">
                <div className="stats-group-title">{t('overview')}</div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-item-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="stat-item-value">{orders.filter(o => o.status !== 'PAID' && o.status !== 'CANCELLED').length}</div>
                    <div className="stat-item-label">{t('activeOrders')}</div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-item-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="stat-item-value">{reports?.today.revenue.toFixed(2) || '0'}</div>
                    <div className="stat-item-label">{t('todayRevenue')}</div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-item-icon" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="stat-item-value">{newOrdersCount}</div>
                    <div className="stat-item-label">{t('newOrders')}</div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-item-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="stat-item-value">{preparingOrdersCount}</div>
                    <div className="stat-item-label">{t('preparing')}</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <div className="quick-actions-title">{t('quickActions')}</div>
                <div className="quick-actions-grid">
                  <button 
                    className="quick-action-btn"
                    onClick={() => setAdminTab('orders')}
                  >
                    <div className="quick-action-icon">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <span className="quick-action-label">
                      {t('manageOrders')}
                      {newOrdersCount > 0 && (
                        <span className="badge badge-error" style={{ marginLeft: '8px' }}>{newOrdersCount}</span>
                      )}
                    </span>
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => setAdminTab('menu')}
                  >
                    <div className="quick-action-icon">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="quick-action-label">{t('manageMenu')}</span>
                  </button>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="section-card">
                <div className="section-card-header">
                  <div className="section-card-title">
                    <div className="section-card-title-icon">
                      <Clock className="w-4 h-4" />
                    </div>
                    {t('recentOrders')}
                  </div>
                </div>
                <div className="grouped-list">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">{t('table')} {order.tableNumber}</div>
                        <div className="grouped-list-item-subtitle">{order.orderItems.length} {t('productCount')}</div>
                      </div>
                      <span className={`order-status-badge ${STATUS_CLASSES[order.status]}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="empty-state" style={{ padding: '32px' }}>
                      <div className="empty-state-icon">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <div className="empty-state-title">{t('noOrders')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {adminTab === 'orders' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h2">{t('orders')}</h2>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => fetchOrders()}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="filter-chips">
                <button
                  className={`filter-chip ${orderFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setOrderFilter('all')}
                >
                  {t('filterAll')}
                </button>
                <button
                  className={`filter-chip ${orderFilter === 'NEW' ? 'active' : ''}`}
                  onClick={() => setOrderFilter('NEW')}
                >
                  {t('filterNew')} {newOrdersCount > 0 && `(${newOrdersCount})`}
                </button>
                <button
                  className={`filter-chip ${orderFilter === 'PREPARING' ? 'active' : ''}`}
                  onClick={() => setOrderFilter('PREPARING')}
                >
                  {t('preparing')}
                </button>
                <button
                  className={`filter-chip ${orderFilter === 'READY' ? 'active' : ''}`}
                  onClick={() => setOrderFilter('READY')}
                >
                  {t('filterReady')}
                </button>
              </div>

              {/* Orders List */}
              <div className="space-y-3 mt-4">
                {filteredOrders.map(order => {
                  const action = STATUS_ACTIONS[order.status];
                  return (
                    <div key={order.id} className="order-group">
                      <div className="order-group-header">
                        <div className="order-group-info">
                          <span className="order-group-table">{t('table')} {order.tableNumber}</span>
                          <span className={`order-status-badge ${STATUS_CLASSES[order.status]}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <span className="order-group-time">
                          {new Date(order.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="order-group-items">
                        {order.orderItems.map(item => (
                          <div key={item.id} className="order-group-item">
                            <span className="order-group-item-name">{getOrderItemDisplayName(item)}</span>
                            <span className="order-group-item-qty">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-group-total">
                        <span className="order-group-total-label">{t('total')}</span>
                        <span className="order-group-total-value">{order.total.toFixed(2)} {currency}</span>
                      </div>
                      {action && (
                        <div className="order-group-actions">
                          <button
                            className="btn btn-primary flex-1"
                            onClick={() => advanceOrderStatus(order.id, order.status)}
                          >
                            <action.icon className="w-4 h-4" />
                            {getStatusActionLabel(order.status)}
                          </button>
                          {order.status !== 'CANCELLED' && (
                            <button
                              className="btn btn-danger btn-icon"
                              onClick={() => cancelOrder(order.id)}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <div className="empty-state-title">{t('noOrders')}</div>
                    <div className="empty-state-description">{t('noOrdersInFilter')}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Menu Tab */}
          {adminTab === 'menu' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h2">{t('menuManagement')}</h2>
              </div>

              {/* Categories Section */}
              <div className="section-card mb-4">
                <div className="section-card-header">
                  <div className="section-card-title">
                    <div className="section-card-title-icon">
                      <Layers className="w-4 h-4" />
                    </div>
                    {t('categories')}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      resetCategoryForm();
                      setIsCategoryDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    {t('add')}
                  </button>
                </div>
                <div className="grouped-list">
                  {categories.map(category => (
                    <div key={category.id} className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">{category.nameAr}</div>
                        <div className="grouped-list-item-subtitle">{category.name}</div>
                      </div>
                      <div className="grouped-list-item-action">
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => {
                            setEditingCategory(category);
                            setCategoryForm({ name: category.name, nameAr: category.nameAr, image: category.image || '' });
                            setIsCategoryDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon text-[var(--error)]"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="empty-state" style={{ padding: '24px' }}>
                      <div className="empty-state-title">{t('noCategories')}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Products Section */}
              <div className="section-card mb-4">
                <div className="section-card-header">
                  <div className="section-card-title">
                    <div className="section-card-title-icon">
                      <Package className="w-4 h-4" />
                    </div>
                    {t('products')}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      resetProductForm();
                      setIsProductDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    {t('add')}
                  </button>
                </div>
                <div className="grouped-list custom-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {products.map(product => (
                    <div key={product.id} className="grouped-list-item">
                      <div className="grouped-list-item-image">
                        {product.image ? (
                          <img src={product.image} alt={product.nameAr} />
                        ) : (
                          <Coffee className="w-6 h-6 text-[var(--text-muted)]" />
                        )}
                      </div>
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">{product.nameAr}</div>
                        <div className="grouped-list-item-subtitle" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          {product.price} {currency}
                        </div>
                      </div>
                      <div className="grouped-list-item-action">
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => {
                            setEditingProduct(product);
                            setProductForm({
                              name: product.name,
                              nameAr: product.nameAr,
                              description: product.description || '',
                              descriptionAr: product.descriptionAr || '',
                              price: product.price.toString(),
                              image: product.image || '',
                              categoryId: product.categoryId,
                              available: product.available
                            });
                            setIsProductDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon text-[var(--error)]"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="empty-state" style={{ padding: '24px' }}>
                      <div className="empty-state-title">{t('noProducts')}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tables Section */}
              <div className="section-card">
                <div className="section-card-header">
                  <div className="section-card-title">
                    <div className="section-card-title-icon">
                      <TableIcon className="w-4 h-4" />
                    </div>
                    {t('tables')}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      resetTableForm();
                      setIsTableDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    {t('add')}
                  </button>
                </div>
                <div className="section-card-body">
                  {tables.length === 0 ? (
                    <div className="empty-state" style={{ padding: '24px' }}>
                      <div className="empty-state-icon">
                        <TableIcon className="w-6 h-6" />
                      </div>
                      <div className="empty-state-title">{t('noTables')}</div>
                      <div className="empty-state-description">{t('addTablesHint')}</div>
                    </div>
                  ) : (
                    <div className="table-select-grid">
                      {tables.map(table => (
                        <button
                          key={table.id}
                          className="table-select-btn"
                          onClick={() => {
                            setEditingTable(table);
                            setTableForm({
                              number: table.number.toString(),
                              seats: table.seats.toString(),
                              description: table.description || ''
                            });
                            setIsTableDialogOpen(true);
                          }}
                        >
                          {table.number}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {adminTab === 'database' && (
            <div className="p-4 space-y-4">
              <h2 className="text-h2">{t('databaseManagement')}</h2>
              
              {/* Database Stats */}
              <div className="section-card">
                <div className="section-card-header">
                  <div className="section-card-title">
                    <div className="section-card-title-icon" style={{ background: 'var(--primary-light)' }}>
                      <Database className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    </div>
                    {t('databaseStats')}
                  </div>
                </div>
                <div className="section-card-body">
                  <div className="db-stats-grid">
                    <div className="db-stat-item">
                      <div className="db-stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <div className="db-stat-content">
                        <div className="db-stat-value">{dbStats?.orders || orders.length || 0}</div>
                        <div className="db-stat-label">{t('dbOrdersLabel')}</div>
                      </div>
                    </div>
                    <div className="db-stat-item">
                      <div className="db-stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="db-stat-content">
                        <div className="db-stat-value">{dbStats?.products || products.length || 0}</div>
                        <div className="db-stat-label">{t('dbProductsLabel')}</div>
                      </div>
                    </div>
                    <div className="db-stat-item">
                      <div className="db-stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="db-stat-content">
                        <div className="db-stat-value">{dbStats?.categories || categories.length || 0}</div>
                        <div className="db-stat-label">{t('dbCategoriesLabel')}</div>
                      </div>
                    </div>
                    <div className="db-stat-item">
                      <div className="db-stat-icon" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
                        <TableIcon className="w-5 h-5" />
                      </div>
                      <div className="db-stat-content">
                        <div className="db-stat-value">{dbStats?.tables || tables.length || 0}</div>
                        <div className="db-stat-label">{t('dbTablesLabel')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Backup Section */}
              <div className="section-card">
                <div className="section-card-header">
                  <div className="section-card-title">
                    <div className="section-card-title-icon" style={{ background: 'var(--success-light)' }}>
                      <Download className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    </div>
                    {t('backup')}
                  </div>
                </div>
                <div className="section-card-body">
                <div className="db-action-row">
                  <div className="db-action-info">
                    <div className="db-action-title">{t('exportData')}</div>
                    <div className="db-action-desc">{t('backupDesc')}</div>
                  </div>
                  <button
                    className="btn btn-success"
                    onClick={downloadBackup}
                    disabled={isDbLoading}
                  >
                    <FileJson className="w-4 h-4" />
                    {isDbLoading ? t('loadingShort') : t('download')}
                  </button>
                </div>
                </div>
              </div>

              {/* Delete Specific Data */}
              <div className="section-card">
                <div className="section-card-header">
                  <div className="section-card-title">
                    <div className="section-card-title-icon" style={{ background: 'var(--warning-light)' }}>
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                    </div>
                    {t('deleteSpecificData')}
                  </div>
                </div>
                <div className="section-card-body">
                  <div className="grouped-list">
                    {/* Delete Old Orders */}
                    <div className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">{t('oldOrdersTitle')}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <input
                            type="number"
                            className="input input-sm"
                            style={{ width: '80px', textAlign: 'center' }}
                            value={deleteOlderThan}
                            onChange={(e) => setDeleteOlderThan(parseInt(e.target.value) || 30)}
                            min={1}
                          />
                          <span className="text-small text-[var(--text-muted)]">{t('dayAndOlder')}</span>
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={deleteOldOrders}
                        disabled={isDbLoading}
                      >
                        <Calendar className="w-4 h-4" />
                        {t('actionDelete')}
                      </button>
                    </div>

                    <div className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">{t('allOrdersTitle')}</div>
                        <div className="grouped-list-item-subtitle">{dbStats?.orders || orders.length || 0} {t('orders')}</div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={deleteAllOrders}
                        disabled={isDbLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('actionDelete')}
                      </button>
                    </div>

                    <div className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">{t('allProductsTitle')}</div>
                        <div className="grouped-list-item-subtitle">{dbStats?.products || products.length || 0} {t('productCount')}</div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={deleteAllProducts}
                        disabled={isDbLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('actionDelete')}
                      </button>
                    </div>

                    <div className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">{t('allCategoriesTitle')}</div>
                        <div className="grouped-list-item-subtitle">{dbStats?.categories || categories.length || 0} {t('categories')}</div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={deleteAllCategories}
                        disabled={isDbLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('actionDelete')}
                      </button>
                    </div>

                    <div className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">{t('allTablesTitle')}</div>
                        <div className="grouped-list-item-subtitle">{dbStats?.tables || tables.length || 0} {t('tables')}</div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={deleteAllTables}
                        disabled={isDbLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('actionDelete')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Reset */}
              <div className="section-card" style={{ borderColor: 'var(--error)', borderWidth: '2px' }}>
                <div className="section-card-header" style={{ background: 'var(--error-light)' }}>
                  <div className="section-card-title" style={{ color: 'var(--error)' }}>
                    <div className="section-card-title-icon" style={{ background: 'var(--error)' }}>
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    {t('dangerZone')}
                  </div>
                </div>
                <div className="section-card-body">
                  {!showResetConfirm ? (
                    <div className="db-danger-zone">
                      <div className="db-danger-info">
                        <p className="text-body font-medium mb-2">{t('factoryResetTitle')}</p>
                        <p className="text-small text-[var(--text-secondary)]">
                          {t('factoryResetDesc')}
                        </p>
                        <p className="text-small mt-2" style={{ color: 'var(--success)' }}>
                          {t('adminProtectedMsg')}
                        </p>
                      </div>
                      <button
                        className="btn btn-danger w-full"
                        onClick={() => setShowResetConfirm(true)}
                      >
                        <RefreshCcw className="w-4 h-4" />
                        {t('resetDatabaseBtn')}
                      </button>
                    </div>
                  ) : (
                    <div className="db-confirm-reset">
                      <div className="db-confirm-warning">
                        <AlertTriangle className="w-8 h-8" style={{ color: 'var(--error)' }} />
                        <p className="text-body font-semibold text-center" style={{ color: 'var(--error)' }}>
                          {t('resetWarningText')}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          className="btn btn-secondary flex-1"
                          onClick={() => setShowResetConfirm(false)}
                          disabled={isDbLoading}
                        >
                          {t('cancel')}
                        </button>
                        <button
                          className="btn btn-danger flex-1"
                          onClick={fullDatabaseReset}
                          disabled={isDbLoading}
                        >
                          {isDbLoading ? t('loadingShort') : t('confirmDeleteBtn')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {adminTab === 'settings' && (
            <div className="p-4">
              <h2 className="text-h2 mb-4">{t('settingsTitle')}</h2>
              
              {/* Cafe Info Settings */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="settings-section-icon">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="settings-section-title">{t('cafeInfoSection')}</div>
                </div>
                <div className="settings-section-body">
                  <div className="space-y-4">
                    <div className="settings-field">
                      <label className="settings-label">{t('language')}</label>
                      <p className="settings-help-text">{t('languageDesc')}</p>
                      <select
                        className="settings-input"
                        value={settingsForm.language}
                        onChange={(e) => {
                          const nextLanguage = e.target.value as AppLanguage;
                          if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) return;
                          const nextForm = { ...settingsForm, language: nextLanguage };
                          setSettingsForm(nextForm);
                          setAppLanguage(nextLanguage);
                          setSettings((prev) => (prev ? { ...prev, language: nextLanguage } : prev));
                          localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
                        }}
                      >
                        <option value="ar">{t('arabic')}</option>
                        <option value="en">{t('english')}</option>
                        <option value="fr">{t('french')}</option>
                      </select>
                    </div>

                    <div className="settings-field">
                      <label className="settings-label">{t('cafeNameLabel')}</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={settingsForm.cafeName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cafeName: e.target.value })}
                        placeholder={t('cafeNamePlaceholder')}
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">{t('cafeLogoLabel')}</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={settingsForm.logo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                        onBlur={async (e) => {
                          const validated = await validateImageUrl(e.target.value);
                          if (validated) {
                            setSettingsForm({ ...settingsForm, logo: validated });
                          }
                        }}
                        placeholder="https://example.com/logo.png"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDriveLink((url) => setSettingsForm({ ...settingsForm, logo: url }))}
                        >
                          {t('driveLinkBtn')}
                        </button>
                      </div>
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">{t('phoneLabel')}</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        placeholder="+216 XX XXX XXX"
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">{t('address')}</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        placeholder={t('addressPlaceholder')}
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">{t('welcomeMessageLabel')}</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={settingsForm.welcomeMessage}
                        onChange={(e) => setSettingsForm({ ...settingsForm, welcomeMessage: e.target.value })}
                        placeholder={t('welcomePlaceholder')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Settings */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="settings-section-icon">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="settings-section-title">{t('openingHoursSection')}</div>
                </div>
                <div className="settings-section-body">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="settings-field">
                        <label className="settings-label">{t('openingTime')}</label>
                        <input
                          type="time"
                          className="settings-input"
                          value={settingsForm.openingHours}
                          onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                        />
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">{t('closingTime')}</label>
                        <input
                          type="time"
                          className="settings-input"
                          value={settingsForm.closingHours}
                          onChange={(e) => setSettingsForm({ ...settingsForm, closingHours: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Settings */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="settings-section-icon">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="settings-section-title">{t('financialSettings')}</div>
                </div>
                <div className="settings-section-body">
                  <div className="space-y-4">
                    <div className="settings-field">
                      <label className="settings-label">{t('currencyLabel')}</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={settingsForm.currency}
                        onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                        placeholder={t('currencyPlaceholder')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Settings */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="settings-section-icon">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div className="settings-section-title">{t('services')}</div>
                </div>
                <div className="settings-section-body">
                  <div className="settings-toggle">
                    <div>
                      <div className="settings-toggle-label">{t('acceptOrders')}</div>
                      <div className="settings-toggle-description">{t('acceptOrdersDesc')}</div>
                    </div>
                    <div 
                      className={`settings-toggle-switch ${settingsForm.acceptOrders ? 'active' : ''}`}
                      onClick={() => setSettingsForm({ ...settingsForm, acceptOrders: !settingsForm.acceptOrders })}
                    />
                  </div>
                </div>
              </div>

              {/* Admin Account */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="settings-section-icon">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="settings-section-title">{t('adminAccountSection')}</div>
                    <p className="settings-help-text">{t('adminAccountDesc')}</p>
                  </div>
                </div>
                <div className="settings-section-body">
                  <div className="space-y-4">
                    <div className="settings-field">
                      <label className="settings-label">{t('adminEmailLabel')}</label>
                      <input
                        type="email"
                        className="settings-input"
                        value={adminAccountForm.email}
                        onChange={(e) => setAdminAccountForm({ ...adminAccountForm, email: e.target.value })}
                        placeholder="admin@cafe.com"
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">{t('newPasswordLabel')}</label>
                      <input
                        type="password"
                        className="settings-input"
                        value={adminAccountForm.password}
                        onChange={(e) => setAdminAccountForm({ ...adminAccountForm, password: e.target.value })}
                        placeholder={t('newPasswordPlaceholder')}
                      />
                    </div>
                    <button
                      className="btn btn-primary w-full"
                      onClick={saveAdminAccount}
                      disabled={isAdminAccountLoading}
                    >
                      {isAdminAccountLoading ? t('loadingShort') : t('adminAccountSave')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Appearance Settings */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="settings-section-icon">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div className="settings-section-title">{t('appearance')}</div>
                </div>
                <div className="settings-section-body">
                  <div className="settings-field">
                    <label className="settings-label">{t('templatesSmart')}</label>
                    <div className="theme-preset-grid">
                      {recommendedThemePresets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          className="theme-preset-card"
                          onClick={() => applyThemePack(preset.colors)}
                        >
                          <div className="theme-preset-swatches">
                            <span style={{ backgroundColor: preset.colors.primaryColor }} />
                            <span style={{ backgroundColor: preset.colors.accentColor }} />
                            <span style={{ backgroundColor: preset.colors.backgroundColor }} />
                            <span style={{ backgroundColor: preset.colors.textPrimaryColor }} />
                          </div>
                          <div className="theme-preset-name">{getPresetText(preset).name}</div>
                          <div className="theme-preset-description">{getPresetText(preset).description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="settings-field">
                    <label className="settings-label">{t('smartSuggestionsByPrimary')}</label>
                    <div className="theme-suggestion-row">
                      {themeSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          className="theme-suggestion-chip"
                          onClick={() => applyThemePack(suggestion.colors)}
                        >
                          <span className="theme-suggestion-dot" style={{ backgroundColor: suggestion.colors.accentColor }} />
                          <span>{t(suggestion.labelKey)}</span>
                          <small>{t(suggestion.hintKey)}</small>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="settings-row">
                    <div className="settings-field">
                      <label className="settings-label">{t('primaryColor')}</label>
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          className="color-picker-preview"
                          value={settingsForm.primaryColor}
                          onChange={(e) => updateThemeColor('primaryColor', e.target.value)}
                        />
                        <select
                          className="settings-input color-menu-select"
                          value=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            updateThemeColor('primaryColor', e.target.value);
                            e.currentTarget.value = '';
                          }}
                        >
                          <option value="">{t('chooseFromList')}</option>
                          {COLOR_MENU_OPTIONS.map((option) => (
                            <option key={`primary-${option.value}`} value={option.value}>
                              {getColorOptionLabel(option.id)} - {option.value}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="settings-input color-picker-input"
                          value={settingsForm.primaryColor}
                          onChange={(e) => updateThemeColor('primaryColor', e.target.value, true)}
                          onBlur={(e) => updateThemeColor('primaryColor', e.target.value)}
                          placeholder="#6F4E37"
                        />
                      </div>
                    </div>

                    <div className="settings-field">
                      <label className="settings-label">{t('accentColor')}</label>
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          className="color-picker-preview"
                          value={settingsForm.accentColor}
                          onChange={(e) => updateThemeColor('accentColor', e.target.value)}
                        />
                        <select
                          className="settings-input color-menu-select"
                          value=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            updateThemeColor('accentColor', e.target.value);
                            e.currentTarget.value = '';
                          }}
                        >
                          <option value="">{t('chooseFromList')}</option>
                          {COLOR_MENU_OPTIONS.map((option) => (
                            <option key={`accent-${option.value}`} value={option.value}>
                              {getColorOptionLabel(option.id)} - {option.value}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="settings-input color-picker-input"
                          value={settingsForm.accentColor}
                          onChange={(e) => updateThemeColor('accentColor', e.target.value, true)}
                          onBlur={(e) => updateThemeColor('accentColor', e.target.value)}
                          placeholder="#D4A574"
                        />
                      </div>
                    </div>

                    <div className="settings-field">
                      <label className="settings-label">{t('backgroundColor')}</label>
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          className="color-picker-preview"
                          value={settingsForm.backgroundColor}
                          onChange={(e) => updateThemeColor('backgroundColor', e.target.value)}
                        />
                        <select
                          className="settings-input color-menu-select"
                          value=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            updateThemeColor('backgroundColor', e.target.value);
                            e.currentTarget.value = '';
                          }}
                        >
                          <option value="">{t('chooseFromList')}</option>
                          {COLOR_MENU_OPTIONS.map((option) => (
                            <option key={`background-${option.value}`} value={option.value}>
                              {getColorOptionLabel(option.id)} - {option.value}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="settings-input color-picker-input"
                          value={settingsForm.backgroundColor}
                          onChange={(e) => updateThemeColor('backgroundColor', e.target.value, true)}
                          onBlur={(e) => updateThemeColor('backgroundColor', e.target.value)}
                          placeholder="#FDF8F3"
                        />
                      </div>
                    </div>

                    <div className="settings-field">
                      <label className="settings-label">{t('surfaceColor')}</label>
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          className="color-picker-preview"
                          value={settingsForm.surfaceColor}
                          onChange={(e) => updateThemeColor('surfaceColor', e.target.value)}
                        />
                        <select
                          className="settings-input color-menu-select"
                          value=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            updateThemeColor('surfaceColor', e.target.value);
                            e.currentTarget.value = '';
                          }}
                        >
                          <option value="">{t('chooseFromList')}</option>
                          {COLOR_MENU_OPTIONS.map((option) => (
                            <option key={`surface-${option.value}`} value={option.value}>
                              {getColorOptionLabel(option.id)} - {option.value}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="settings-input color-picker-input"
                          value={settingsForm.surfaceColor}
                          onChange={(e) => updateThemeColor('surfaceColor', e.target.value, true)}
                          onBlur={(e) => updateThemeColor('surfaceColor', e.target.value)}
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>

                    <div className="settings-field">
                      <label className="settings-label">{t('textPrimaryColor')}</label>
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          className="color-picker-preview"
                          value={settingsForm.textPrimaryColor}
                          onChange={(e) => updateThemeColor('textPrimaryColor', e.target.value)}
                        />
                        <select
                          className="settings-input color-menu-select"
                          value=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            updateThemeColor('textPrimaryColor', e.target.value);
                            e.currentTarget.value = '';
                          }}
                        >
                          <option value="">{t('chooseFromList')}</option>
                          {COLOR_MENU_OPTIONS.map((option) => (
                            <option key={`text-${option.value}`} value={option.value}>
                              {getColorOptionLabel(option.id)} - {option.value}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="settings-input color-picker-input"
                          value={settingsForm.textPrimaryColor}
                          onChange={(e) => updateThemeColor('textPrimaryColor', e.target.value, true)}
                          onBlur={(e) => updateThemeColor('textPrimaryColor', e.target.value)}
                          placeholder="#3D2314"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="theme-live-preview" style={{ backgroundColor: settingsForm.backgroundColor }}>
                    <div className="theme-live-surface" style={{ backgroundColor: settingsForm.surfaceColor, color: settingsForm.textPrimaryColor }}>
                      <div className="theme-live-title">{t('livePreview')}</div>
                      <div className="theme-live-text">{t('livePreviewDesc')}</div>
                      <div className="theme-live-actions">
                        <span
                          className="theme-live-badge"
                          style={{ backgroundColor: settingsForm.primaryColor, color: getContrastText(settingsForm.primaryColor) }}
                        >
                          {t('primaryColorLabel')}
                        </span>
                        <span
                          className="theme-live-badge"
                          style={{ backgroundColor: settingsForm.accentColor, color: getContrastText(settingsForm.accentColor) }}
                        >
                          {t('accentColorLabel')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary w-full mt-2"
                    type="button"
                    onClick={() => applyThemePack(DEFAULT_THEME_COLORS)}
                  >
                    {t('resetTheme')}
                  </button>

                  <div className="settings-toggle">
                    <div>
                      <div className="settings-toggle-label">{t('notificationsSound')}</div>
                      <div className="settings-toggle-description">{t('notificationsSoundDesc')}</div>
                    </div>
                    <div 
                      className={`settings-toggle-switch ${soundEnabled ? 'active' : ''}`}
                      onClick={() => setSoundEnabled(!soundEnabled)}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button className="btn btn-primary btn-lg w-full mb-4" onClick={saveSettings}>
                <Check className="w-5 h-5" />
                {t('saveAllSettings')}
              </button>

              {/* Account */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="settings-section-icon">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="settings-section-title">{t('account')}</div>
                </div>
                <div className="settings-section-body">
                  <button className="btn btn-danger w-full" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <div className="bottom-nav-inner">
            <button
              className={`bottom-nav-item ${adminTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setAdminTab('dashboard')}
            >
              <div className="bottom-nav-icon">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="bottom-nav-label">{t('dashboard')}</span>
              {newOrdersCount > 0 && adminTab !== 'dashboard' && (
                <span className="bottom-nav-badge">{newOrdersCount}</span>
              )}
            </button>
            <button
              className={`bottom-nav-item ${adminTab === 'orders' ? 'active' : ''}`}
              onClick={() => setAdminTab('orders')}
            >
              <div className="bottom-nav-icon">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="bottom-nav-label">{t('orders')}</span>
              {newOrdersCount > 0 && adminTab !== 'orders' && (
                <span className="bottom-nav-badge">{newOrdersCount}</span>
              )}
            </button>
            <button
              className={`bottom-nav-item ${adminTab === 'menu' ? 'active' : ''}`}
              onClick={() => setAdminTab('menu')}
            >
              <div className="bottom-nav-icon">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="bottom-nav-label">{t('menu')}</span>
            </button>
            <button
              className={`bottom-nav-item ${adminTab === 'database' ? 'active' : ''}`}
              onClick={() => setAdminTab('database')}
            >
              <div className="bottom-nav-icon">
                <Database className="w-5 h-5" />
              </div>
              <span className="bottom-nav-label">{t('database')}</span>
            </button>
            <button
              className={`bottom-nav-item ${adminTab === 'settings' ? 'active' : ''}`}
              onClick={() => setAdminTab('settings')}
            >
              <div className="bottom-nav-icon">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <span className="bottom-nav-label">{t('settings')}</span>
            </button>
          </div>
        </nav>

        {/* Product Dialog */}
        {isProductDialogOpen && (
          <>
            <div className="dialog-overlay" onClick={() => setIsProductDialogOpen(false)} />
            <div className="dialog-content animate-slide-up">
              <div className="dialog-handle" />
              <div className="dialog-header">
                <h2 className="dialog-title">{editingProduct ? t('editProductTitle') : t('addProductTitle')}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setIsProductDialogOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="dialog-body space-y-4">
                <div>
                  <label className="label">{t('productNameArLabel')}</label>
                  <input
                    type="text"
                    className="input"
                    value={productForm.nameAr}
                    onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{t('productNameEnLabel')}</label>
                  <input
                    type="text"
                    className="input"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{t('priceLabel')}</label>
                  <input
                    type="number"
                    className="input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{t('categoryLabel')}</label>
                  <select
                    className="input"
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  >
                    <option value="">{t('chooseCategory')}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{getCategoryDisplayName(cat)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">{t('imageUrlLabel')}</label>
                  <input
                    type="text"
                    className="input"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    onBlur={async (e) => {
                      const validated = await validateImageUrl(e.target.value);
                      if (validated) {
                        setProductForm({ ...productForm, image: validated });
                      }
                    }}
                    placeholder="https://..."
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDriveLink((url) => setProductForm({ ...productForm, image: url }))}
                    >
                      {t('driveLinkBtn')}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={productForm.available}
                    onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                  />
                  <label htmlFor="available" className="text-small">{t('availableLabel')}</label>
                </div>
              </div>
              <div className="dialog-footer">
                <button className="btn btn-primary w-full" onClick={saveProduct}>
                  {editingProduct ? t('saveChanges') : t('addProductAction')}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Category Dialog */}
        {isCategoryDialogOpen && (
          <>
            <div className="dialog-overlay" onClick={() => setIsCategoryDialogOpen(false)} />
            <div className="dialog-content animate-slide-up">
              <div className="dialog-handle" />
              <div className="dialog-header">
                <h2 className="dialog-title">{editingCategory ? t('editCategoryTitle') : t('addCategoryTitle')}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setIsCategoryDialogOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="dialog-body space-y-4">
                <div>
                  <label className="label">{t('categoryNameArLabel')}</label>
                  <input
                    type="text"
                    className="input"
                    value={categoryForm.nameAr}
                    onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{t('categoryNameEnLabel')}</label>
                  <input
                    type="text"
                    className="input"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{t('imageUrlLabel')}</label>
                  <input
                    type="text"
                    className="input"
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                    onBlur={async (e) => {
                      const validated = await validateImageUrl(e.target.value);
                      if (validated) {
                        setCategoryForm({ ...categoryForm, image: validated });
                      }
                    }}
                    placeholder="https://..."
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDriveLink((url) => setCategoryForm({ ...categoryForm, image: url }))}
                    >
                      {t('driveLinkBtn')}
                    </button>
                  </div>
                </div>
              </div>
              <div className="dialog-footer">
                <button className="btn btn-primary w-full" onClick={saveCategory}>
                  {editingCategory ? t('saveChanges') : t('addCategoryAction')}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Table Dialog */}
        {isTableDialogOpen && (
          <>
            <div className="dialog-overlay" onClick={() => setIsTableDialogOpen(false)} />
            <div className="dialog-content animate-slide-up">
              <div className="dialog-handle" />
              <div className="dialog-header">
                <h2 className="dialog-title">{editingTable ? t('editTableTitle') : t('addTableTitle')}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setIsTableDialogOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="dialog-body space-y-4">
                <div>
                  <label className="label">{t('tableNumber')}</label>
                  <input
                    type="number"
                    className="input"
                    value={tableForm.number}
                    onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{t('seatsLabel')}</label>
                  <input
                    type="number"
                    className="input"
                    value={tableForm.seats}
                    onChange={(e) => setTableForm({ ...tableForm, seats: e.target.value })}
                  />
                </div>
              </div>
              <div className="dialog-footer flex gap-2">
                {editingTable && (
                  <button 
                    className="btn btn-danger" 
                    onClick={() => {
                      deleteTable(editingTable.id);
                      setIsTableDialogOpen(false);
                    }}
                  >
                    {t('actionDelete')}
                  </button>
                )}
                <button className="btn btn-primary flex-1" onClick={saveTable}>
                  {t('save')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Customer View
  return (
    <div className="min-h-screen bg-[var(--background)]" dir={appDir}>
      {/* App Header */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="flex items-center gap-3">
            {settings?.logo ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--surface-raised)]">
                <img src={settings.logo} alt={cafeName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[var(--gradient-primary)] flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
            )}
            <h1 className="app-title">{cafeName}</h1>
          </div>
          <button 
            className="btn btn-ghost btn-icon"
            onClick={() => setShowLoginDialog(true)}
          >
            <Lock className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="content-padded-bottom">
        {/* Home Tab */}
        {customerTab === 'home' && (
          <>
            {/* Hero Section - Always Show */}
            <div className="hero-section">
              <div className="hero-content">
                {settings?.logo ? (
                  <div className="hero-logo">
                    <img src={settings.logo} alt={cafeName} />
                  </div>
                ) : (
                  <div className="hero-logo-placeholder">
                    <Coffee className="w-10 h-10" />
                  </div>
                )}
                <h2 className="hero-title">{cafeName}</h2>
                <p className="hero-subtitle">{settings?.welcomeMessage || t('welcomeDefault')}</p>
                {settings?.openingHours && settings?.closingHours && (
                  <div className="hero-status">
                    <Clock className="w-4 h-4" />
                    <span>{t('workingHoursLabel')}: {settings.openingHours} - {settings.closingHours}</span>
                  </div>
                )}
                {settings && !settings.acceptOrders && (
                  <div className="hero-status closed" style={{ marginTop: '8px' }}>
                    <Ban className="w-4 h-4" />
                    <span>{t('notAcceptingOrdersNow')}</span>
                  </div>
                )}
                {settings?.phone && (
                  <div className="hero-contact">
                    <a href={`tel:${settings.phone}`} className="hero-phone">
                      <Volume2 className="w-4 h-4" />
                      <span>{settings.phone}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Category Chips */}
            <div className="category-chips">
              <button
                className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                {t('all')}
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-chip ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {getCategoryDisplayName(category)}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="product-grid">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`product-card ${settings?.acceptOrders !== false ? 'card-interactive' : 'unavailable'}`}
                  style={{ opacity: settings?.acceptOrders === false ? 0.6 : 1 }}
                >
                  <div className="product-card-image-wrapper">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={getProductDisplayName(product)}
                        className="product-card-image"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Coffee className="w-12 h-12 text-[var(--text-muted)]" />
                      </div>
                    )}
                    {selectedProducts.has(product.id) && (
                      <div className="product-card-badge">
                         {selectedProducts.get(product.id)} {t('inCart')}
                      </div>
                    )}
                  </div>
                  <div className="product-card-content">
                    <div className="product-card-name">{getProductDisplayName(product)}</div>
                    {getProductDescription(product) && (
                      <div className="product-card-description">{getProductDescription(product)}</div>
                    )}
                    <div className="product-card-footer">
                      <span className="product-card-price">{product.price} {currency}</span>
                      {settings?.acceptOrders !== false && (
                        <button 
                          className="product-card-add"
                          onClick={(e) => {
                            e.stopPropagation();
                            addProductToCart(product.id);
                          }}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-2 empty-state">
                  <div className="empty-state-icon">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <div className="empty-state-title">{t('noProducts')}</div>
                  <div className="empty-state-description">{t('noProductsInCategory')}</div>
                </div>
              )}
            </div>

            {/* Floating Cart Button */}
            {getCartCount() > 0 && settings?.acceptOrders !== false && (
              <button
                className="fab"
                onClick={() => setCustomerTab('cart')}
              >
                <ShoppingCart className="w-5 h-5" />
                {getCartCount()} • {getOrderTotal().toFixed(2)} {currency}
              </button>
            )}
          </>
        )}

        {/* Cart Tab */}
        {customerTab === 'cart' && (
          <div className="p-4">
                <h2 className="text-h2 mb-4">{t('cart')}</h2>
            
            {getSelectedProductsList().length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div className="empty-state-title">{t('cartEmpty')}</div>
                <div className="empty-state-description">{t('addFromMenu')}</div>
                <button 
                  className="btn btn-primary mt-4"
                  onClick={() => setCustomerTab('home')}
                >
                  {t('browseMenu')}
                </button>
              </div>
            ) : (
              <>
                <div className="cart-container">
                  <div className="cart-header">
                    <div className="cart-title">
                      <ShoppingCart className="w-5 h-5" />
                      {t('selectedProducts')}
                      <span className="cart-count-badge">{getCartCount()}</span>
                    </div>
                  </div>
                  <div className="cart-items">
                    {getSelectedProductsList().map(({ product, quantity }) => (
                      <div key={product.id} className="cart-item-row">
                        <div className="cart-item-image">
                          {product.image ? (
                            <img src={product.image} alt={getProductDisplayName(product)} />
                          ) : (
                            <Coffee className="w-6 h-6 text-[var(--text-muted)]" />
                          )}
                        </div>
                        <div className="cart-item-details">
                          <div className="cart-item-name">{getProductDisplayName(product)}</div>
                          <div className="cart-item-price">{product.price} {currency}</div>
                        </div>
                        <div className="cart-item-controls">
                          <button
                            className="cart-qty-button"
                            onClick={() => updateProductQuantity(product.id, quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="cart-qty-display">{quantity}</span>
                          <button
                            className="cart-qty-button"
                            onClick={() => updateProductQuantity(product.id, quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-footer">
                    <div className="cart-total-row">
                      <span className="cart-total-label">{t('subtotal')}</span>
                      <span className="cart-total-value" style={{ fontSize: '16px' }}>{getOrderTotal().toFixed(2)} {currency}</span>
                    </div>
                    <div className="cart-total-row" style={{ paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <span className="cart-total-label" style={{ fontWeight: 600 }}>{t('total')}</span>
                      <span className="cart-total-value">
                        {getOrderTotal().toFixed(2)} {currency}
                      </span>
                    </div>
                    <button
                      className="btn btn-primary btn-lg w-full"
                      onClick={() => {
                        fetchTablesStatus();
                        setShowOrderDialog(true);
                      }}
                    >
                      <Check className="w-5 h-5" />
                      {t('confirmOrder')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Track Tab */}
        {customerTab === 'track' && (
          <div className="track-page">
            {/* Unified Card with Hero + Search */}
            <div className="track-unified-card">
              {/* Hero Section */}
              <div className="track-hero">
                <div className="track-hero-icon">
                  <Search className="w-6 h-6" />
                </div>
                <h2 className="track-hero-title">{t('trackOrder')}</h2>
                <p className="track-hero-subtitle">{t('enterTrackingCode')}</p>
              </div>
              
              {/* Search Input - Connected to Hero */}
              <div className="track-search-box">
                <div className="track-input-row">
                  <input
                    type="text"
                    className="track-code-input"
                    placeholder="ABC123"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                  <button
                    className="track-search-btn"
                    onClick={trackOrder}
                    disabled={isTrackingLoading || !trackingCode.trim()}
                  >
                    {isTrackingLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t('tracking')}</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>{t('startTracking')}</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="track-input-hint">{t('trackingCodeHint')}</div>
                
                {/* Quick Access to Last Order */}
                {lastOrderCode && !trackedOrder && (
                  <button 
                    className="track-last-order-btn"
                    onClick={() => {
                      setTrackingCode(lastOrderCode);
                      trackOrder(lastOrderCode);
                    }}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>{t('lastOrder')}: <strong>{lastOrderCode}</strong></span>
                  </button>
                )}
              </div>
            </div>

            {/* Tracked Order Display */}
            {trackedOrder ? (
              <div className="track-order-content">
                {/* Order Status Header */}
                <div className="track-status-card">
                  <div className="track-status-top">
                    <div className="track-code-display">{trackedOrder.orderCode}</div>
                    {trackedOrder.status !== 'PAID' && trackedOrder.status !== 'CANCELLED' && (
                      <div className="track-live-tag">
                        <span className="track-live-pulse"></span>
                        {t('live')}
                      </div>
                    )}
                  </div>
                  <div className="track-status-bottom">
                    <div className="track-table-tag">
                      <TableIcon className="w-4 h-4" />
                      {t('table')} {trackedOrder.tableNumber}
                    </div>
                    <div className={`track-status-tag track-status-${trackedOrder.status.toLowerCase()}`}>
                      {getStatusLabel(trackedOrder.status)}
                    </div>
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="track-section-card">
                  <div className="track-section-header">
                    <Clock className="w-4 h-4" />
                    <span>{t('orderStages')}</span>
                  </div>
                  
                  <div className="track-timeline">
                    {['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'PAID'].map((status, index) => {
                      const statusOrder = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'PAID'];
                      const currentIndex = statusOrder.indexOf(trackedOrder.status);
                      const isCompleted = index <= currentIndex && currentIndex !== -1;
                      const isCurrent = status === trackedOrder.status;
                      const isCancelled = trackedOrder.status === 'CANCELLED';
                      const isPast = index < currentIndex && currentIndex !== -1;
                      
                      return (
                        <div 
                          key={status} 
                          className={`track-step ${isCompleted ? 'done' : ''} ${isCurrent ? 'active' : ''} ${isCancelled && isCurrent ? 'cancelled' : ''}`}
                        >
                          <div className="track-step-line">
                            {index > 0 && <div className={`track-step-fill ${isPast ? 'filled' : ''}`} />}
                          </div>
                          <div className="track-step-dot">
                            {isCompleted && !isCancelled ? (
                              <Check className="w-3 h-3" />
                            ) : isCancelled && isCurrent ? (
                              <X className="w-3 h-3" />
                            ) : null}
                          </div>
                          <span className="track-step-text">{getStatusLabel(status as OrderStatus)}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Special Status Messages */}
                  {trackedOrder.status === 'CANCELLED' && (
                    <div className="track-alert track-alert-error">
                      <AlertTriangle className="w-5 h-5" />
                      <span>{t('cancelledOrder')}</span>
                    </div>
                  )}
                  
                  {trackedOrder.status === 'READY' && (
                    <div className="track-alert track-alert-success">
                      <PackageCheck className="w-5 h-5" />
                      <div>
                         <div className="track-alert-title">{t('orderReady')}</div>
                         <div className="track-alert-sub">{t('pickupNow')}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="track-section-card">
                  <div className="track-section-header">
                    <Coffee className="w-4 h-4" />
                    <span>{t('items')}</span>
                    <span className="track-count-badge">{trackedOrder.orderItems.length}</span>
                  </div>
                  <div className="track-items">
                    {trackedOrder.orderItems.map((item) => (
                      <div key={item.id} className="track-item">
                        <div className="track-item-info">
                          <span className="track-item-name">{getOrderItemDisplayName(item)}</span>
                          <span className="track-item-price">{item.price} {currency}</span>
                        </div>
                        <span className="track-item-qty">×{item.quantity}</span>
                        <span className="track-item-total">{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="track-total">
                    <span>{t('total')}</span>
                    <span>{trackedOrder.total.toFixed(2)} {currency}</span>
                  </div>
                </div>

                {/* Order Meta */}
                <div className="track-meta-row">
                  <div className="track-meta-item">
                    <Clock className="w-4 h-4" />
                    <div>
                      <span className="track-meta-label">{t('time')}</span>
                      <span className="track-meta-value">
                        {new Date(trackedOrder.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="track-meta-item">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <span className="track-meta-label">{t('date')}</span>
                      <span className="track-meta-value">
                        {new Date(trackedOrder.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="track-empty">
                <div className="track-empty-icon">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div className="track-empty-text">{t('noTrackedOrder')}</div>
                <div className="track-empty-hint">{t('trackEmptyHint')}</div>
              </div>
            )}
          </div>
        )}

        {/* More Tab */}
        {customerTab === 'more' && (
          <div className="p-4">
            <h2 className="text-h2 mb-4">{t('more')}</h2>
            
            {/* Cafe Info */}
            {(settings?.phone || settings?.address || settings?.openingHours) && (
              <div className="section-card mb-4">
                <div className="section-card-header">
                  <div className="section-card-title">
                    <div className="section-card-title-icon">
                      <Store className="w-4 h-4" />
                    </div>
                    {t('cafeInfo')}
                  </div>
                </div>
                <div className="section-card-body">
                  <div className="grouped-list">
                    {settings?.phone && (
                      <a 
                        href={`tel:${settings.phone}`}
                        className="grouped-list-item"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="grouped-list-item-image" style={{ background: 'var(--success-light)' }}>
                          <Volume2 className="w-5 h-5" style={{ color: 'var(--success)' }} />
                        </div>
                        <div className="grouped-list-item-content">
                          <div className="grouped-list-item-title">{t('callUs')}</div>
                          <div className="grouped-list-item-subtitle">{settings.phone}</div>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-[var(--text-muted)]" />
                      </a>
                    )}
                    {settings?.address && (
                      <div className="grouped-list-item">
                        <div className="grouped-list-item-image" style={{ background: 'var(--info-light)' }}>
                          <MapPin className="w-5 h-5" style={{ color: 'var(--info)' }} />
                        </div>
                        <div className="grouped-list-item-content">
                          <div className="grouped-list-item-title">{t('address')}</div>
                          <div className="grouped-list-item-subtitle">{settings.address}</div>
                        </div>
                      </div>
                    )}
                    {settings?.openingHours && settings?.closingHours && (
                      <div className="grouped-list-item">
                        <div className="grouped-list-item-image" style={{ background: 'var(--warning-light)' }}>
                          <Clock className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                        </div>
                        <div className="grouped-list-item-content">
                          <div className="grouped-list-item-title">{t('workingHours')}</div>
                          <div className="grouped-list-item-subtitle">{settings.openingHours} - {settings.closingHours}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Admin Login */}
            <button
              className="section-card w-full text-right mb-4"
              onClick={() => setShowLoginDialog(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className="grouped-list-item">
                <div className="grouped-list-item-image" style={{ background: 'var(--primary-light)' }}>
                  <LogIn className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                </div>
                <div className="grouped-list-item-content">
                  <div className="grouped-list-item-title">{t('adminLogin')}</div>
                  <div className="grouped-list-item-subtitle">{t('adminLoginDesc')}</div>
                </div>
                <ChevronLeft className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
            </button>

            {/* App Info */}
            <div className="section-card">
              <div className="section-card-body-padded text-center">
                {settings?.logo ? (
                  <div className="w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden">
                    <img src={settings.logo} alt={cafeName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-[var(--gradient-primary)] flex items-center justify-center">
                    <Coffee className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="font-semibold text-lg mb-1">{cafeName}</div>
                <div className="text-small text-[var(--text-muted)]">{t('systemLabel')}</div>
                <div className="text-small text-[var(--text-muted)] mt-1">{t('version')} 2.0.0</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <button
            className={`bottom-nav-item ${customerTab === 'home' ? 'active' : ''}`}
            onClick={() => setCustomerTab('home')}
          >
            <div className="bottom-nav-icon">
              <Home className="w-5 h-5" />
            </div>
            <span className="bottom-nav-label">{t('home')}</span>
          </button>
          <button
            className={`bottom-nav-item ${customerTab === 'cart' ? 'active' : ''}`}
            onClick={() => setCustomerTab('cart')}
          >
            <div className="bottom-nav-icon relative">
              <ShoppingCart className="w-5 h-5" />
              {getCartCount() > 0 && (
                <span className="bottom-nav-badge">{getCartCount()}</span>
              )}
            </div>
            <span className="bottom-nav-label">{t('cart')}</span>
          </button>
          <button
            className={`bottom-nav-item ${customerTab === 'track' ? 'active' : ''}`}
            onClick={() => setCustomerTab('track')}
          >
            <div className="bottom-nav-icon">
              <Search className="w-5 h-5" />
            </div>
            <span className="bottom-nav-label">{t('track')}</span>
          </button>
          <button
            className={`bottom-nav-item ${customerTab === 'more' ? 'active' : ''}`}
            onClick={() => setCustomerTab('more')}
          >
            <div className="bottom-nav-icon">
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="bottom-nav-label">{t('more')}</span>
          </button>
        </div>
      </nav>

      {/* Order Success Dialog */}
      {showOrderSuccess && lastOrderCode && (
        <>
          <div className="dialog-overlay" onClick={() => setShowOrderSuccess(false)} />
          <div className="dialog-content animate-slide-up">
            <div className="dialog-handle" />
            <div className="dialog-header">
              <h2 className="dialog-title text-center w-full">✅ {t('orderSent')}</h2>
            </div>
            <div className="dialog-body text-center">
              <div className="order-success-icon mb-4">
                <Check className="w-12 h-12" />
              </div>
              
              <p className="text-body text-[var(--text-secondary)] mb-6">
                {t('keepTrackingCode')}
              </p>
              
              <div className="order-code-display">
                <div className="order-code-label">{t('trackingCode')}</div>
                <div className="order-code-value">{lastOrderCode}</div>
              </div>
              
              <button
                className="btn btn-secondary w-full mt-4"
                onClick={copyTrackingCode}
              >
                <Download className="w-4 h-4" />
                {t('copyCode')}
              </button>
            </div>
            <div className="dialog-footer flex gap-3">
              <button
                className="btn btn-secondary flex-1"
                onClick={() => setShowOrderSuccess(false)}
              >
                {t('close')}
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={goToTrackOrder}
              >
                {t('continueTracking')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Login Dialog */}
      {showLoginDialog && (
        <>
          <div className="dialog-overlay" onClick={() => setShowLoginDialog(false)} />
          <div className="dialog-content animate-slide-up">
            <div className="dialog-handle" />
            <div className="dialog-header">
              <h2 className="dialog-title">{t('adminLoginTitle')}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowLoginDialog(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="dialog-body space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="label">{t('adminEmail')}</label>
                <input
                  type="email"
                  className="input"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="admin@cafe.com"
                  required
                />
              </div>
              <div>
                <label className="label">{t('password')}</label>
                <input
                  type="password"
                  className="input"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
            </form>
            <div className="dialog-footer">
              <button
                className="btn btn-primary w-full"
                onClick={handleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    {t('verifyInProgress')}
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {t('signIn')}
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Order Dialog */}
      {showOrderDialog && (
        <>
          <div className="dialog-overlay" onClick={() => setShowOrderDialog(false)} />
          <div className="dialog-content animate-slide-up">
            <div className="dialog-handle" />
            <div className="dialog-header">
              <h2 className="dialog-title">{t('orderConfirmation')}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowOrderDialog(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="dialog-body" style={{ paddingBottom: '8px' }}>
              {/* Table Selection */}
              <div className="order-confirm-section">
                <div className="order-confirm-section-header">
                  <TableIcon className="w-4 h-4" />
                  <span>{t('tableNumber')}</span>
                  {isLoadingTablesStatus && <RefreshCw className="w-4 h-4 animate-spin text-[var(--text-muted)]" />}
                </div>
                {tables.length === 0 ? (
                  <div className="order-confirm-empty">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{t('noTablesAvailable')}</span>
                  </div>
                ) : (
                  <>
                    <div className="order-tables-grid">
                      {tables.map(table => {
                        const isOccupied = occupiedTables.has(table.id);
                        const isSelected = selectedTableId === table.id;
                        return (
                          <button
                            key={table.id}
                            type="button"
                            className={`order-table-btn ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
                            onClick={() => !isOccupied && setSelectedTableId(table.id)}
                            disabled={isOccupied}
                          >
                            {isOccupied ? (
                              <>
                                <Ban className="w-3 h-3 absolute top-1 right-1" />
                                <span>{table.number}</span>
                              </>
                            ) : (
                              table.number
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {occupiedTables.size > 0 && (
                      <div className="mt-2 text-small text-[var(--text-muted)] flex items-center gap-2">
                        <Ban className="w-4 h-4 text-[var(--error)]" />
                        <span>{t('blockedTablesHint')}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Order Summary */}
              <div className="order-confirm-section">
                <div className="order-confirm-section-header">
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t('orderLabel')}</span>
                  <span className="order-items-count">{getSelectedProductsList().length} {t('orderItemWord')}</span>
                </div>
                <div className="order-items-list">
                  {getSelectedProductsList().map(({ product, quantity }) => (
                    <div key={product.id} className="order-item-row">
                      <div className="order-item-info">
                        <span className="order-item-name">{getProductDisplayName(product)}</span>
                        <span className="order-item-price">{product.price} {currency}</span>
                      </div>
                      <div className="order-item-qty">×{quantity}</div>
                      <div className="order-item-total">{(product.price * quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                {/* Total - moved inside order summary */}
                <div className="order-total-card">
                  <span className="order-total-label">{t('total')}</span>
                  <span className="order-total-value">{getOrderTotal().toFixed(2)} {currency}</span>
                </div>
              </div>
            </div>
            
            {/* Fixed Footer with buttons */}
            <div className="order-confirm-actions">
              <button
                className="order-confirm-btn"
                onClick={submitOrder}
                disabled={!selectedTableId || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{t('sending')}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>{t('confirmOrder')}</span>
                  </>
                )}
              </button>
              <button
                className="order-cancel-btn"
                onClick={() => setShowOrderDialog(false)}
              >
                <X className="w-4 h-4" />
                <span>{t('cancel')}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
