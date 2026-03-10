'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Category, Product, Table, Order, OrderStatus, Reports, ORDER_STATUS_AR } from '@/types';
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
  Moon,
  Sun,
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
const STATUS_ACTIONS: Record<OrderStatus, { next: OrderStatus; label: string; icon: typeof Check } | null> = {
  NEW: { next: 'ACCEPTED', label: 'قبول الطلب', icon: Check },
  ACCEPTED: { next: 'PREPARING', label: 'بدء التحضير', icon: ChefHat },
  PREPARING: { next: 'READY', label: 'تم التحضير', icon: PackageCheck },
  READY: { next: 'SERVED', label: 'تم التقديم', icon: HandPlatter },
  SERVED: { next: 'PAID', label: 'تم الدفع', icon: CreditCard },
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
  const [darkMode, setDarkMode] = useState(false);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all');
  
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
  
  // Form states
  const [productForm, setProductForm] = useState({
    name: '', nameAr: '', description: '', descriptionAr: '',
    price: '', image: '', categoryId: '', available: true
  });
  
  const [categoryForm, setCategoryForm] = useState({ name: '', nameAr: '', image: '' });
  const [tableForm, setTableForm] = useState({ number: '', seats: '4', description: '' });
  const [settingsForm, setSettingsForm] = useState({ 
    cafeName: '', 
    currency: 'د.ت',
    logo: '',
    primaryColor: '#6F4E37',
    openingHours: '08:00',
    closingHours: '23:00',
    phone: '',
    address: '',
    welcomeMessage: '',
    acceptOrders: true,
    taxRate: 0,
    enableTableService: true,
    enableDelivery: false
  });

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, []);

  // Realtime polling for admin - always poll when authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      pollingRef.current = setInterval(() => {
        fetchOrders();
      }, 1000); // Poll every 1 second for real-time updates
    }
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isAdminAuthenticated]);
  
  // Realtime polling for customer tracking
  useEffect(() => {
    if (customerTab === 'track' && trackedOrder) {
      customerPollingRef.current = setInterval(() => {
        refreshTrackedOrder();
      }, 1000); // Poll every 1 second for real-time updates
    }
    
    return () => {
      if (customerPollingRef.current) {
        clearInterval(customerPollingRef.current);
      }
    };
  }, [customerTab, trackedOrder]);

  // Fetch table status (occupied/available) - مصدر واحد للطاولات وحالتها
  const fetchTablesStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/tables/status', { 
        cache: 'no-store'
      });
      if (!res.ok) {
        console.error('fetchTablesStatus HTTP error:', res.status);
        return;
      }
      const data = await res.json();
      
      // تحديث قائمة الطاولات
      if (Array.isArray(data)) {
        setTables(data.map((t: { id: string; number: number; seats: number; description: string | null; active: boolean }) => ({
          id: t.id,
          number: t.number,
          seats: t.seats,
          description: t.description,
          active: t.active
        })));
        
        // تحديث الطاولات المشغولة
        const occupied = new Set(data.filter((t: { isOccupied: boolean }) => t.isOccupied).map((t: { id: string }) => t.id));
        console.log('🔴 Occupied tables:', Array.from(occupied));
        setOccupiedTables(occupied);
      }
    } catch (error) {
      console.error('fetchTablesStatus error:', error);
    }
  }, []);

  // Realtime polling for table status (always poll for customers)
  useEffect(() => {
    // Poll immediately on mount
    fetchTablesStatus();
    
    // Then poll every 200ms for instant table lock (fast response)
    tablePollingRef.current = setInterval(() => {
      fetchTablesStatus();
    }, 200);
    
    return () => {
      if (tablePollingRef.current) {
        clearInterval(tablePollingRef.current);
      }
    };
  }, [fetchTablesStatus]);

  // Sound notification for new orders
  useEffect(() => {
    if (isAdminAuthenticated && orders.length > prevOrdersCountRef.current && soundEnabled) {
      const newOrders = orders.filter(o => o.status === 'NEW');
      if (newOrders.length > 0) {
        playNotificationSound();
        toast({ 
          title: '🔔 طلب جديد!', 
          description: `لديك ${newOrders.length} طلب جديد` 
        });
      }
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders, isAdminAuthenticated, soundEnabled]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sound notification for READY status in customer tracking
  useEffect(() => {
    if (trackedOrder && prevTrackedStatus && trackedOrder.status === 'READY' && prevTrackedStatus !== 'READY') {
      playReadySound();
      toast({ 
        title: '🎉 طلبك جاهز!', 
        description: 'يمكنك استلام طلبك الآن' 
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
      const data = await res.json();
      setIsAdminAuthenticated(data.authenticated);
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
      await Promise.allSettled([
        fetchSettings(),
        fetchCategories(),
        fetchProducts(),
        fetchTables(),
        fetchOrders()
      ]);
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
      setSettings(data);
      setSettingsForm({ 
        cafeName: data.cafeName, 
        currency: data.currency,
        logo: data.logo || '',
        primaryColor: data.primaryColor || '#6F4E37',
        openingHours: data.openingHours || '08:00',
        closingHours: data.closingHours || '23:00',
        phone: data.phone || '',
        address: data.address || '',
        welcomeMessage: data.welcomeMessage || '',
        acceptOrders: data.acceptOrders ?? true,
        taxRate: data.taxRate ?? 0,
        enableTableService: data.enableTableService ?? true,
        enableDelivery: data.enableDelivery ?? false
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
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setTables(data);
        // تحديث occupiedTables من isOccupied
        const occupied = new Set(data.filter((t: { isOccupied?: boolean }) => t.isOccupied).map((t: { id: string }) => t.id));
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
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('fetchOrders error:', error);
      throw error;
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
        toast({ title: '✅ تم تسجيل الدخول', description: 'مرحباً بك في لوحة الإدارة' });
      } else {
        toast({ title: '❌ خطأ', description: data.error || 'فشل تسجيل الدخول', variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل تسجيل الدخول', variant: 'destructive' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAdminAuthenticated(false);
      toast({ title: '👋 تم تسجيل الخروج', description: 'تم تسجيل خروجك بنجاح' });
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل تسجيل الخروج', variant: 'destructive' });
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
      toast({ title: '⚠️ تنبيه', description: 'الرجاء اختيار رقم الطاولة', variant: 'destructive' });
      return;
    }
    if (selectedProducts.size === 0) {
      toast({ title: '⚠️ تنبيه', description: 'لم تختر أي منتج', variant: 'destructive' });
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
        fetchOrders();
      } else if (res.status === 409) {
        // خطأ: الطاولة مشغولة
        const data = await res.json();
        console.error('Table occupied:', data);
        
        // تحديث حالة الطاولات
        fetchTablesStatus();
        
        // إغلاق نافذة الطلب وإظهار رسالة واضحة
        setShowOrderDialog(false);
        setSelectedTableId('');
        
        toast({ 
          title: '🚫 الطاولة مشغولة!', 
          description: data.details || 'هذه الطاولة لديها طلب جاري. يرجى اختيار طاولة أخرى.',
          variant: 'destructive'
        });
      } else {
        const data = await res.json();
        console.error('Order creation failed:', data);
        toast({ 
          title: '❌ خطأ', 
          description: data.details || data.error || 'فشل في إرسال الطلب', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Submit order error:', error);
      toast({ title: '❌ خطأ', description: 'فشل في الاتصال بالخادم', variant: 'destructive' });
    } finally {
      setTimeout(() => setIsSubmitting(false), 1000);
    }
  }, [isSubmitting, selectedTableId, selectedProducts, tables]);

  // Track order by code
  const trackOrder = async () => {
    if (!trackingCode.trim()) {
      toast({ title: '⚠️ تنبيه', description: 'يرجى إدخال كود التتبع', variant: 'destructive' });
      return;
    }
    
    setIsTrackingLoading(true);
    try {
      const res = await fetch(`/api/track?code=${trackingCode.trim().toUpperCase()}`, {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const order = await res.json();
        setTrackedOrder(order);
        toast({ title: '✅ تم العثور على الطلب', description: `طلب رقم ${order.tableNumber}` });
      } else {
        const data = await res.json();
        toast({ title: '❌ خطأ', description: data.error || 'لم يتم العثور على الطلب', variant: 'destructive' });
        setTrackedOrder(null);
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل في البحث عن الطلب', variant: 'destructive' });
      setTrackedOrder(null);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  // Refresh tracked order (for polling)
  const refreshTrackedOrder = async () => {
    if (!trackedOrder?.orderCode) return;
    
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
    }
  };

  // Copy tracking code to clipboard
  const copyTrackingCode = () => {
    if (lastOrderCode) {
      navigator.clipboard.writeText(lastOrderCode);
      toast({ title: '✅ تم النسخ', description: `تم نسخ الكود: ${lastOrderCode}` });
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
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        toast({ title: '✅ تم التحديث', description: 'تم تحديث حالة الطلب' });
        fetchOrders();
      } else {
        const data = await res.json();
        toast({ title: '❌ خطأ', description: data.error || 'فشل في تحديث الطلب', variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل في تحديث الطلب', variant: 'destructive' });
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
    if (confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
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
        toast({ title: '✅ تم الحفظ', description: 'تم تحديث الإعدادات' });
      } else {
        const errorData = await res.json();
        toast({ title: '❌ خطأ', description: errorData.error || 'فشل في حفظ الإعدادات', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast({ title: '❌ خطأ', description: 'فشل في حفظ الإعدادات', variant: 'destructive' });
    }
  };

  // Product CRUD
  const saveProduct = async () => {
    if (!productForm.name || !productForm.nameAr || !productForm.price || !productForm.categoryId) {
      toast({ title: '⚠️ تنبيه', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
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
        toast({ title: '✅ تم الحفظ', description: editingProduct ? 'تم تعديل المنتج' : 'تم إضافة المنتج' });
        setIsProductDialogOpen(false);
        resetProductForm();
        fetchProducts();
      } else {
        const data = await res.json();
        toast({ title: '❌ خطأ', description: data.error || 'فشل في حفظ المنتج', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Save product error:', error);
      toast({ title: '❌ خطأ', description: 'فشل في الاتصال بالخادم', variant: 'destructive' });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      toast({ title: '✅ تم الحذف', description: 'تم حذف المنتج' });
      fetchProducts();
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل في حذف المنتج', variant: 'destructive' });
    }
  };

  const resetProductForm = () => {
    setProductForm({ name: '', nameAr: '', description: '', descriptionAr: '', price: '', image: '', categoryId: '', available: true });
    setEditingProduct(null);
  };

  // Category CRUD
  const saveCategory = async () => {
    if (!categoryForm.name || !categoryForm.nameAr) {
      toast({ title: '⚠️ تنبيه', description: 'يرجى إدخال اسم الفئة باللغتين', variant: 'destructive' });
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
        toast({ title: '✅ تم الحفظ', description: editingCategory ? 'تم تعديل الفئة' : 'تم إضافة الفئة' });
        setIsCategoryDialogOpen(false);
        resetCategoryForm();
        fetchCategories();
      } else {
        const data = await res.json();
        toast({ title: '❌ خطأ', description: data.error || 'فشل في حفظ الفئة', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Save category error:', error);
      toast({ title: '❌ خطأ', description: 'فشل في الاتصال بالخادم', variant: 'destructive' });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف جميع المنتجات التابعة لها.')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      toast({ title: '✅ تم الحذف', description: 'تم حذف الفئة' });
      fetchCategories();
      fetchProducts();
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل في حذف الفئة', variant: 'destructive' });
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
      toast({ title: '⚠️ تنبيه', description: 'يرجى إدخال رقم صحيح للطاولة', variant: 'destructive' });
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
          toast({ title: '✅ تم التحديث', description: 'تم تعديل الطاولة' });
          setIsTableDialogOpen(false);
          resetTableForm();
          fetchTables();
        } else {
          const data = await res.json();
          toast({ title: '❌ خطأ', description: data.error || 'فشل في تعديل الطاولة', variant: 'destructive' });
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
          toast({ title: '✅ تم الإضافة', description: 'تم إضافة الطاولة بنجاح' });
          setIsTableDialogOpen(false);
          resetTableForm();
          fetchTables();
        } else {
          const data = await res.json();
          toast({ title: '❌ خطأ', description: data.error || 'فشل في إضافة الطاولة', variant: 'destructive' });
        }
      }
    } catch (error) {
      console.error('Save table error:', error);
      toast({ title: '❌ خطأ', description: 'فشل في الاتصال بالخادم', variant: 'destructive' });
    }
  };

  const deleteTable = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الطاولة؟')) return;
    try {
      await fetch(`/api/tables?id=${id}`, { method: 'DELETE' });
      toast({ title: '✅ تم الحذف', description: 'تم حذف الطاولة' });
      fetchTables();
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل في حذف الطاولة', variant: 'destructive' });
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

  // Count orders by status
  const newOrdersCount = orders.filter(o => o.status === 'NEW').length;
  const preparingOrdersCount = orders.filter(o => o.status === 'PREPARING' || o.status === 'ACCEPTED').length;
  const readyOrdersCount = orders.filter(o => o.status === 'READY').length;

  const currency = settings?.currency || 'د.ت';
  const cafeName = settings?.cafeName || "L'EscoBar";

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
        toast({ title: '✅ تم', description: 'تم تحميل النسخة الاحتياطية بنجاح' });
      } else {
        toast({ title: '❌ خطأ', description: 'فشل في إنشاء النسخة الاحتياطية', variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل في إنشاء النسخة الاحتياطية', variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  const deleteOldOrders = async () => {
    if (!confirm(`هل أنت متأكد من حذف الطلبات الأقدم من ${deleteOlderThan} يوم؟`)) return;
    
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
        toast({ title: '✅ تم الحذف', description: data.message });
        fetchDbStats();
        fetchOrders();
      } else {
        toast({ title: '❌ خطأ', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل في حذف الطلبات', variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  const deleteAllOrders = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع الطلبات؟ هذا الإجراء لا يمكن التراجع عنه!')) return;
    
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
        toast({ title: '✅ تم الحذف', description: data.message });
        fetchDbStats();
        fetchOrders();
      } else {
        toast({ title: '❌ خطأ', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل في حذف الطلبات', variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  const deleteAllProducts = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع المنتجات؟ سيتم حذف الطلبات أيضاً!')) return;
    
    try {
      setIsDbLoading(true);
      const res = await fetch('/api/admin/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-products' })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast({ title: '✅ تم الحذف', description: data.message });
        fetchDbStats();
        fetchProducts();
        fetchOrders();
      } else {
        toast({ title: '❌ خطأ', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل في حذف المنتجات', variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  const deleteAllCategories = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع الفئات؟ سيتم حذف المنتجات والطلبات أيضاً!')) return;
    
    try {
      setIsDbLoading(true);
      const res = await fetch('/api/admin/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-categories' })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast({ title: '✅ تم الحذف', description: data.message });
        fetchDbStats();
        fetchCategories();
        fetchProducts();
        fetchOrders();
      } else {
        toast({ title: '❌ خطأ', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل في حذف الفئات', variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  const deleteAllTables = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع الطاولات؟ سيتم حذف الطلبات أيضاً!')) return;
    
    try {
      setIsDbLoading(true);
      const res = await fetch('/api/admin/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-tables' })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast({ title: '✅ تم الحذف', description: data.message });
        fetchDbStats();
        fetchTables();
        fetchOrders();
      } else {
        toast({ title: '❌ خطأ', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل في حذف الطاولات', variant: 'destructive' });
    } finally {
      setIsDbLoading(false);
    }
  };

  const fullDatabaseReset = async () => {
    if (!confirm('⚠️ تحذير! سيتم حذف جميع البيانات نهائياً!\n\nسيتم حذف:\n- جميع الطلبات\n- جميع المنتجات\n- جميع الفئات\n- جميع الطاولات\n- الإعدادات\n\nلن يتم حذف حساب المسؤول.\n\nهل أنت متأكد؟')) return;
    if (!confirm('⚠️ هذا الإجراء لا يمكن التراجع عنه!\n\nهل أنت متأكد 100%؟')) return;
    
    try {
      setIsDbLoading(true);
      const res = await fetch('/api/admin/database', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-full' })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast({ title: '✅ تم إعادة الضبط', description: data.message });
        setShowResetConfirm(false);
        fetchDbStats();
        fetchAllData();
      } else {
        toast({ title: '❌ خطأ', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'فشل في إعادة ضبط قاعدة البيانات', variant: 'destructive' });
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
          <p className="text-[var(--text-secondary)]">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Admin View
  if (isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)]" dir="rtl">
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
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
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
              <h2 className="text-h2 mb-4">لوحة التحكم</h2>
              
              {/* Stats Group */}
              <div className="stats-group">
                <div className="stats-group-title">نظرة عامة</div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-item-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="stat-item-value">{orders.filter(o => o.status !== 'PAID' && o.status !== 'CANCELLED').length}</div>
                    <div className="stat-item-label">طلبات نشطة</div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-item-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="stat-item-value">{reports?.today.revenue.toFixed(2) || '0'}</div>
                    <div className="stat-item-label">إيرادات اليوم</div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-item-icon" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="stat-item-value">{newOrdersCount}</div>
                    <div className="stat-item-label">طلبات جديدة</div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-item-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="stat-item-value">{preparingOrdersCount}</div>
                    <div className="stat-item-label">قيد التحضير</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <div className="quick-actions-title">إجراءات سريعة</div>
                <div className="quick-actions-grid">
                  <button 
                    className="quick-action-btn"
                    onClick={() => setAdminTab('orders')}
                  >
                    <div className="quick-action-icon">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <span className="quick-action-label">
                      إدارة الطلبات
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
                    <span className="quick-action-label">إدارة القائمة</span>
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
                    الطلبات الأخيرة
                  </div>
                </div>
                <div className="grouped-list">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">طاولة {order.tableNumber}</div>
                        <div className="grouped-list-item-subtitle">{order.orderItems.length} منتج</div>
                      </div>
                      <span className={`order-status-badge ${STATUS_CLASSES[order.status]}`}>
                        {ORDER_STATUS_AR[order.status]}
                      </span>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="empty-state" style={{ padding: '32px' }}>
                      <div className="empty-state-icon">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <div className="empty-state-title">لا توجد طلبات</div>
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
                <h2 className="text-h2">الطلبات</h2>
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
                  الكل
                </button>
                <button
                  className={`filter-chip ${orderFilter === 'NEW' ? 'active' : ''}`}
                  onClick={() => setOrderFilter('NEW')}
                >
                  جديد {newOrdersCount > 0 && `(${newOrdersCount})`}
                </button>
                <button
                  className={`filter-chip ${orderFilter === 'PREPARING' ? 'active' : ''}`}
                  onClick={() => setOrderFilter('PREPARING')}
                >
                  قيد التحضير
                </button>
                <button
                  className={`filter-chip ${orderFilter === 'READY' ? 'active' : ''}`}
                  onClick={() => setOrderFilter('READY')}
                >
                  جاهز
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
                          <span className="order-group-table">طاولة {order.tableNumber}</span>
                          <span className={`order-status-badge ${STATUS_CLASSES[order.status]}`}>
                            {ORDER_STATUS_AR[order.status]}
                          </span>
                        </div>
                        <span className="order-group-time">
                          {new Date(order.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="order-group-items">
                        {order.orderItems.map(item => (
                          <div key={item.id} className="order-group-item">
                            <span className="order-group-item-name">{item.productName}</span>
                            <span className="order-group-item-qty">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-group-total">
                        <span className="order-group-total-label">المجموع</span>
                        <span className="order-group-total-value">{order.total.toFixed(2)} {currency}</span>
                      </div>
                      {action && (
                        <div className="order-group-actions">
                          <button
                            className="btn btn-primary flex-1"
                            onClick={() => advanceOrderStatus(order.id, order.status)}
                          >
                            <action.icon className="w-4 h-4" />
                            {action.label}
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
                    <div className="empty-state-title">لا توجد طلبات</div>
                    <div className="empty-state-description">لم يتم العثور على طلبات بهذا التصنيف</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Menu Tab */}
          {adminTab === 'menu' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h2">إدارة القائمة</h2>
              </div>

              {/* Categories Section */}
              <div className="section-card mb-4">
                <div className="section-card-header">
                  <div className="section-card-title">
                    <div className="section-card-title-icon">
                      <Layers className="w-4 h-4" />
                    </div>
                    الفئات
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      resetCategoryForm();
                      setIsCategoryDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    إضافة
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
                      <div className="empty-state-title">لا توجد فئات</div>
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
                    المنتجات
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      resetProductForm();
                      setIsProductDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    إضافة
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
                      <div className="empty-state-title">لا توجد منتجات</div>
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
                    الطاولات
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      resetTableForm();
                      setIsTableDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    إضافة
                  </button>
                </div>
                <div className="section-card-body">
                  {tables.length === 0 ? (
                    <div className="empty-state" style={{ padding: '24px' }}>
                      <div className="empty-state-icon">
                        <TableIcon className="w-6 h-6" />
                      </div>
                      <div className="empty-state-title">لا توجد طاولات</div>
                      <div className="empty-state-description">أضف طاولات للمقهى</div>
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
              <h2 className="text-h2">إدارة البيانات</h2>
              
              {/* Database Stats */}
              <div className="section-card">
                <div className="section-card-header">
                  <div className="section-card-title">
                    <div className="section-card-title-icon" style={{ background: 'var(--primary-light)' }}>
                      <Database className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    </div>
                    إحصائيات قاعدة البيانات
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
                        <div className="db-stat-label">طلبات</div>
                      </div>
                    </div>
                    <div className="db-stat-item">
                      <div className="db-stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="db-stat-content">
                        <div className="db-stat-value">{dbStats?.products || products.length || 0}</div>
                        <div className="db-stat-label">منتجات</div>
                      </div>
                    </div>
                    <div className="db-stat-item">
                      <div className="db-stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="db-stat-content">
                        <div className="db-stat-value">{dbStats?.categories || categories.length || 0}</div>
                        <div className="db-stat-label">فئات</div>
                      </div>
                    </div>
                    <div className="db-stat-item">
                      <div className="db-stat-icon" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
                        <TableIcon className="w-5 h-5" />
                      </div>
                      <div className="db-stat-content">
                        <div className="db-stat-value">{dbStats?.tables || tables.length || 0}</div>
                        <div className="db-stat-label">طاولات</div>
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
                    النسخ الاحتياطي
                  </div>
                </div>
                <div className="section-card-body">
                  <div className="db-action-row">
                    <div className="db-action-info">
                      <div className="db-action-title">تصدير البيانات</div>
                      <div className="db-action-desc">تحميل نسخة احتياطية كاملة بصيغة JSON</div>
                    </div>
                    <button
                      className="btn btn-success"
                      onClick={downloadBackup}
                      disabled={isDbLoading}
                    >
                      <FileJson className="w-4 h-4" />
                      {isDbLoading ? 'جاري...' : 'تحميل'}
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
                    حذف بيانات محددة
                  </div>
                </div>
                <div className="section-card-body">
                  <div className="grouped-list">
                    {/* Delete Old Orders */}
                    <div className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">طلبات قديمة</div>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            className="input input-sm"
                            style={{ width: '60px', textAlign: 'center' }}
                            value={deleteOlderThan}
                            onChange={(e) => setDeleteOlderThan(parseInt(e.target.value) || 30)}
                            min={1}
                          />
                          <span className="text-small text-[var(--text-muted)]">يوم وأقدم</span>
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={deleteOldOrders}
                        disabled={isDbLoading}
                      >
                        <Calendar className="w-4 h-4" />
                        حذف
                      </button>
                    </div>

                    <div className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">جميع الطلبات</div>
                        <div className="grouped-list-item-subtitle">{dbStats?.orders || orders.length || 0} طلب</div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={deleteAllOrders}
                        disabled={isDbLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>

                    <div className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">جميع المنتجات</div>
                        <div className="grouped-list-item-subtitle">{dbStats?.products || products.length || 0} منتج</div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={deleteAllProducts}
                        disabled={isDbLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>

                    <div className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">جميع الفئات</div>
                        <div className="grouped-list-item-subtitle">{dbStats?.categories || categories.length || 0} فئة</div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={deleteAllCategories}
                        disabled={isDbLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>

                    <div className="grouped-list-item">
                      <div className="grouped-list-item-content">
                        <div className="grouped-list-item-title">جميع الطاولات</div>
                        <div className="grouped-list-item-subtitle">{dbStats?.tables || tables.length || 0} طاولة</div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={deleteAllTables}
                        disabled={isDbLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
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
                    منطقة الخطر
                  </div>
                </div>
                <div className="section-card-body">
                  {!showResetConfirm ? (
                    <div className="db-danger-zone">
                      <div className="db-danger-info">
                        <p className="text-body font-medium mb-2">إعادة ضبط المصنع</p>
                        <p className="text-small text-[var(--text-secondary)]">
                          سيتم حذف جميع البيانات نهائياً: الطلبات، المنتجات، الفئات، الطاولات، الإعدادات
                        </p>
                        <p className="text-small mt-2" style={{ color: 'var(--success)' }}>
                          ✓ حساب المسؤول محمي ولن يتم حذفه
                        </p>
                      </div>
                      <button
                        className="btn btn-danger w-full"
                        onClick={() => setShowResetConfirm(true)}
                      >
                        <RefreshCcw className="w-4 h-4" />
                        إعادة ضبط قاعدة البيانات
                      </button>
                    </div>
                  ) : (
                    <div className="db-confirm-reset">
                      <div className="db-confirm-warning">
                        <AlertTriangle className="w-8 h-8" style={{ color: 'var(--error)' }} />
                        <p className="text-body font-semibold text-center" style={{ color: 'var(--error)' }}>
                          تحذير! هذا الإجراء لا يمكن التراجع عنه
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          className="btn btn-secondary flex-1"
                          onClick={() => setShowResetConfirm(false)}
                          disabled={isDbLoading}
                        >
                          إلغاء
                        </button>
                        <button
                          className="btn btn-danger flex-1"
                          onClick={fullDatabaseReset}
                          disabled={isDbLoading}
                        >
                          {isDbLoading ? 'جاري...' : 'تأكيد الحذف'}
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
              <h2 className="text-h2 mb-4">الإعدادات</h2>
              
              {/* Cafe Info Settings */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="settings-section-icon">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="settings-section-title">معلومات المقهى</div>
                </div>
                <div className="settings-section-body">
                  <div className="space-y-4">
                    <div className="settings-field">
                      <label className="settings-label">اسم المقهى</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={settingsForm.cafeName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cafeName: e.target.value })}
                        placeholder="اسم المقهى"
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">شعار المقهى (رابط صورة)</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={settingsForm.logo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">رقم الهاتف</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        placeholder="+216 XX XXX XXX"
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">العنوان</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        placeholder="شارع المثال، المدينة"
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">رسالة الترحيب</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={settingsForm.welcomeMessage}
                        onChange={(e) => setSettingsForm({ ...settingsForm, welcomeMessage: e.target.value })}
                        placeholder="مرحباً بك في مقهانا"
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
                  <div className="settings-section-title">أوقات العمل</div>
                </div>
                <div className="settings-section-body">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="settings-field">
                        <label className="settings-label">وقت الفتح</label>
                        <input
                          type="time"
                          className="settings-input"
                          value={settingsForm.openingHours}
                          onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                        />
                      </div>
                      <div className="settings-field">
                        <label className="settings-label">وقت الإغلاق</label>
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
                  <div className="settings-section-title">الإعدادات المالية</div>
                </div>
                <div className="settings-section-body">
                  <div className="space-y-4">
                    <div className="settings-field">
                      <label className="settings-label">العملة</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={settingsForm.currency}
                        onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                        placeholder="د.ت"
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">نسبة الضريبة (%)</label>
                      <input
                        type="number"
                        className="settings-input"
                        value={settingsForm.taxRate}
                        onChange={(e) => setSettingsForm({ ...settingsForm, taxRate: parseFloat(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        step="0.1"
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
                  <div className="settings-section-title">الخدمات</div>
                </div>
                <div className="settings-section-body">
                  <div className="settings-toggle">
                    <div>
                      <div className="settings-toggle-label">قبول الطلبات</div>
                      <div className="settings-toggle-description">السماح للعملاء بتقديم طلبات جديدة</div>
                    </div>
                    <div 
                      className={`settings-toggle-switch ${settingsForm.acceptOrders ? 'active' : ''}`}
                      onClick={() => setSettingsForm({ ...settingsForm, acceptOrders: !settingsForm.acceptOrders })}
                    />
                  </div>
                  <div className="settings-toggle">
                    <div>
                      <div className="settings-toggle-label">خدمة الطاولات</div>
                      <div className="settings-toggle-description">تفعيل نظام حجز الطاولات</div>
                    </div>
                    <div 
                      className={`settings-toggle-switch ${settingsForm.enableTableService ? 'active' : ''}`}
                      onClick={() => setSettingsForm({ ...settingsForm, enableTableService: !settingsForm.enableTableService })}
                    />
                  </div>
                  <div className="settings-toggle">
                    <div>
                      <div className="settings-toggle-label">خدمة التوصيل</div>
                      <div className="settings-toggle-description">تفعيل خدمة توصيل الطلبات</div>
                    </div>
                    <div 
                      className={`settings-toggle-switch ${settingsForm.enableDelivery ? 'active' : ''}`}
                      onClick={() => setSettingsForm({ ...settingsForm, enableDelivery: !settingsForm.enableDelivery })}
                    />
                  </div>
                </div>
              </div>

              {/* Appearance Settings */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="settings-section-icon">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div className="settings-section-title">المظهر</div>
                </div>
                <div className="settings-section-body">
                  <div className="settings-field">
                    <label className="settings-label">اللون الرئيسي</label>
                    <div className="color-picker-wrapper">
                      <div 
                        className="color-picker-preview"
                        style={{ backgroundColor: settingsForm.primaryColor }}
                      />
                      <input
                        type="text"
                        className="settings-input color-picker-input"
                        value={settingsForm.primaryColor}
                        onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                        placeholder="#6F4E37"
                      />
                    </div>
                  </div>
                  <div className="settings-toggle">
                    <div>
                      <div className="settings-toggle-label">الوضع الداكن</div>
                      <div className="settings-toggle-description">تغيير مظهر التطبيق</div>
                    </div>
                    <div 
                      className={`settings-toggle-switch ${darkMode ? 'active' : ''}`}
                      onClick={() => setDarkMode(!darkMode)}
                    />
                  </div>
                  <div className="settings-toggle">
                    <div>
                      <div className="settings-toggle-label">صوت الإشعارات</div>
                      <div className="settings-toggle-description">تشغيل صوت عند وصول طلب جديد</div>
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
                حفظ جميع الإعدادات
              </button>

              {/* Account */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="settings-section-icon">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="settings-section-title">الحساب</div>
                </div>
                <div className="settings-section-body">
                  <button className="btn btn-danger w-full" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
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
              <span className="bottom-nav-label">لوحة التحكم</span>
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
              <span className="bottom-nav-label">الطلبات</span>
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
              <span className="bottom-nav-label">القائمة</span>
            </button>
            <button
              className={`bottom-nav-item ${adminTab === 'database' ? 'active' : ''}`}
              onClick={() => setAdminTab('database')}
            >
              <div className="bottom-nav-icon">
                <Database className="w-5 h-5" />
              </div>
              <span className="bottom-nav-label">البيانات</span>
            </button>
            <button
              className={`bottom-nav-item ${adminTab === 'settings' ? 'active' : ''}`}
              onClick={() => setAdminTab('settings')}
            >
              <div className="bottom-nav-icon">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <span className="bottom-nav-label">الإعدادات</span>
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
                <h2 className="dialog-title">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج'}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setIsProductDialogOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="dialog-body space-y-4">
                <div>
                  <label className="label">اسم المنتج (عربي)</label>
                  <input
                    type="text"
                    className="input"
                    value={productForm.nameAr}
                    onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">اسم المنتج (إنجليزي)</label>
                  <input
                    type="text"
                    className="input"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">السعر</label>
                  <input
                    type="number"
                    className="input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">الفئة</label>
                  <select
                    className="input"
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">رابط الصورة</label>
                  <input
                    type="text"
                    className="input"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={productForm.available}
                    onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                  />
                  <label htmlFor="available" className="text-small">متوفر</label>
                </div>
              </div>
              <div className="dialog-footer">
                <button className="btn btn-primary w-full" onClick={saveProduct}>
                  {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}
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
                <h2 className="dialog-title">{editingCategory ? 'تعديل الفئة' : 'إضافة فئة'}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setIsCategoryDialogOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="dialog-body space-y-4">
                <div>
                  <label className="label">اسم الفئة (عربي)</label>
                  <input
                    type="text"
                    className="input"
                    value={categoryForm.nameAr}
                    onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">اسم الفئة (إنجليزي)</label>
                  <input
                    type="text"
                    className="input"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">رابط الصورة</label>
                  <input
                    type="text"
                    className="input"
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="dialog-footer">
                <button className="btn btn-primary w-full" onClick={saveCategory}>
                  {editingCategory ? 'حفظ التغييرات' : 'إضافة الفئة'}
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
                <h2 className="dialog-title">{editingTable ? 'تعديل الطاولة' : 'إضافة طاولة'}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setIsTableDialogOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="dialog-body space-y-4">
                <div>
                  <label className="label">رقم الطاولة</label>
                  <input
                    type="number"
                    className="input"
                    value={tableForm.number}
                    onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">عدد المقاعد</label>
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
                    حذف
                  </button>
                )}
                <button className="btn btn-primary flex-1" onClick={saveTable}>
                  حفظ
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
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
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
              {settings?.welcomeMessage && (
                <p className="hero-subtitle">{settings.welcomeMessage}</p>
              ) || (
                <p className="hero-subtitle">مرحباً بك في مقهانا</p>
              )}
              {settings?.openingHours && settings?.closingHours && (
                <div className="hero-status">
                  <Clock className="w-4 h-4" />
                  <span>ساعات العمل: {settings.openingHours} - {settings.closingHours}</span>
                </div>
              )}
              {settings && !settings.acceptOrders && (
                <div className="hero-status closed" style={{ marginTop: '8px' }}>
                  <Ban className="w-4 h-4" />
                  <span>غير مستقبلين طلبات حالياً</span>
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

            {/* Category Chips */}
            <div className="category-chips">
              <button
                className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                الكل
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-chip ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.nameAr}
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
                        alt={product.nameAr}
                        className="product-card-image"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Coffee className="w-12 h-12 text-[var(--text-muted)]" />
                      </div>
                    )}
                    {selectedProducts.has(product.id) && (
                      <div className="product-card-badge">
                        {selectedProducts.get(product.id)} في السلة
                      </div>
                    )}
                  </div>
                  <div className="product-card-content">
                    <div className="product-card-name">{product.nameAr}</div>
                    {product.descriptionAr && (
                      <div className="product-card-description">{product.descriptionAr}</div>
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
                  <div className="empty-state-title">لا توجد منتجات</div>
                  <div className="empty-state-description">لا توجد منتجات في هذه الفئة حالياً</div>
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
                {getCartCount()} منتج • {getOrderTotal().toFixed(2)} {currency}
              </button>
            )}
          </>
        )}

        {/* Cart Tab */}
        {customerTab === 'cart' && (
          <div className="p-4">
            <h2 className="text-h2 mb-4">السلة</h2>
            
            {getSelectedProductsList().length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div className="empty-state-title">السلة فارغة</div>
                <div className="empty-state-description">أضف منتجات من القائمة</div>
                <button 
                  className="btn btn-primary mt-4"
                  onClick={() => setCustomerTab('home')}
                >
                  تصفح القائمة
                </button>
              </div>
            ) : (
              <>
                <div className="cart-container">
                  <div className="cart-header">
                    <div className="cart-title">
                      <ShoppingCart className="w-5 h-5" />
                      المنتجات المختارة
                      <span className="cart-count-badge">{getCartCount()}</span>
                    </div>
                  </div>
                  <div className="cart-items">
                    {getSelectedProductsList().map(({ product, quantity }) => (
                      <div key={product.id} className="cart-item-row">
                        <div className="cart-item-image">
                          {product.image ? (
                            <img src={product.image} alt={product.nameAr} />
                          ) : (
                            <Coffee className="w-6 h-6 text-[var(--text-muted)]" />
                          )}
                        </div>
                        <div className="cart-item-details">
                          <div className="cart-item-name">{product.nameAr}</div>
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
                      <span className="cart-total-label">المجموع الفرعي</span>
                      <span className="cart-total-value" style={{ fontSize: '16px' }}>{getOrderTotal().toFixed(2)} {currency}</span>
                    </div>
                    {settings && settings.taxRate > 0 && (
                      <div className="cart-total-row" style={{ marginBottom: '8px' }}>
                        <span className="cart-total-label">الضريبة ({settings.taxRate}%)</span>
                        <span className="cart-total-value" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                          {(getOrderTotal() * settings.taxRate / 100).toFixed(2)} {currency}
                        </span>
                      </div>
                    )}
                    <div className="cart-total-row" style={{ paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <span className="cart-total-label" style={{ fontWeight: 600 }}>الإجمالي</span>
                      <span className="cart-total-value">
                        {settings?.taxRate 
                          ? (getOrderTotal() * (1 + settings.taxRate / 100)).toFixed(2)
                          : getOrderTotal().toFixed(2)
                        } {currency}
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
                      تأكيد الطلب
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Track Tab */}
        {customerTab === 'track' && (
          <div className="p-4">
            <h2 className="text-h2 mb-4">تتبع الطلب</h2>
            
            {/* Search Input */}
            <div className="section-card mb-4">
              <div className="section-card-body">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="أدخل كود التتبع (مثل: ABC123)"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{ textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold' }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={trackOrder}
                    disabled={isTrackingLoading || !trackingCode.trim()}
                  >
                    {isTrackingLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Tracked Order Display */}
            {trackedOrder ? (
              <div className="space-y-4">
                {/* Order Status Timeline */}
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-card-title">
                      <div className="section-card-title-icon" style={{ background: 'var(--primary-light)' }}>
                        <ClipboardList className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      </div>
                      حالة الطلب
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Live indicator */}
                      {trackedOrder.status !== 'PAID' && trackedOrder.status !== 'CANCELLED' && (
                        <div className="live-indicator">
                          <Radio className="w-3 h-3" />
                          <span>مباشر</span>
                        </div>
                      )}
                      <div className="order-code-badge">{trackedOrder.orderCode}</div>
                    </div>
                  </div>
                  <div className="section-card-body">
                    <div className="order-timeline-enhanced">
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
                            className={`timeline-item-enhanced ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isCancelled && isCurrent ? 'cancelled' : ''} ${isPast ? 'past' : ''}`}
                          >
                            <div className="timeline-connector">
                              {index > 0 && <div className={`timeline-line ${isPast ? 'filled' : ''}`} />}
                            </div>
                            <div className="timeline-node">
                              <div className={`timeline-icon-wrapper ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isCancelled && isCurrent ? 'cancelled' : ''}`}>
                                {isCompleted && !isCancelled ? (
                                  <Check className="w-4 h-4" />
                                ) : isCancelled && isCurrent ? (
                                  <X className="w-4 h-4" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-current" />
                                )}
                              </div>
                              <div className="timeline-label-enhanced">{ORDER_STATUS_AR[status as keyof typeof ORDER_STATUS_AR]}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {trackedOrder.status === 'CANCELLED' && (
                      <div className="mt-4 p-3 rounded-lg animate-pulse-subtle" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">تم إلغاء الطلب</span>
                        </div>
                      </div>
                    )}
                    
                    {trackedOrder.status === 'READY' && (
                      <div className="mt-4 p-4 rounded-lg animate-bounce-subtle" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--success)' }}>
                            <PackageCheck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="font-bold text-lg">طلبك جاهز للاستلام!</span>
                            <p className="text-small opacity-80">يمكنك المرور لاستلام طلبك</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-card-title">
                      <div className="section-card-title-icon" style={{ background: 'var(--info-light)' }}>
                        <Coffee className="w-4 h-4" style={{ color: 'var(--info)' }} />
                      </div>
                      تفاصيل الطلب
                    </div>
                  </div>
                  <div className="section-card-body">
                    <div className="grouped-list">
                      {trackedOrder.orderItems.map((item) => (
                        <div key={item.id} className="grouped-list-item">
                          <div className="grouped-list-item-content">
                            <div className="grouped-list-item-title">{item.productName}</div>
                            <div className="grouped-list-item-subtitle">{item.price} {currency}</div>
                          </div>
                          <div className="text-body font-medium">×{item.quantity}</div>
                        </div>
                      ))}
                    </div>
                    <div className="cart-total-row mt-4 pt-4 border-t border-[var(--border)]">
                      <span className="cart-total-label">المجموع</span>
                      <span className="cart-total-value">{trackedOrder.total.toFixed(2)} {currency}</span>
                    </div>
                  </div>
                </div>

                {/* Table Info */}
                <div className="section-card">
                  <div className="section-card-body">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
                          <TableIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                          <div className="text-small text-[var(--text-muted)]">رقم الطاولة</div>
                          <div className="text-h3">{trackedOrder.tableNumber}</div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-small text-[var(--text-muted)]">وقت الطلب</div>
                        <div className="text-body">
                          {new Date(trackedOrder.createdAt).toLocaleTimeString('ar-SA', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Search className="w-6 h-6" />
                </div>
                <div className="empty-state-title">أدخل كود التتبع</div>
                <div className="empty-state-description">
                  {lastOrderCode 
                    ? `كود طلبك الأخير: ${lastOrderCode}` 
                    : 'أدخل الكود المكون من 6 أحرف لمتابعة طلبك'
                  }
                </div>
                {lastOrderCode && (
                  <button 
                    className="btn btn-primary mt-4"
                    onClick={() => {
                      setTrackingCode(lastOrderCode);
                      setTimeout(trackOrder, 100);
                    }}
                  >
                    تتبع طلبي الأخير
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* More Tab */}
        {customerTab === 'more' && (
          <div className="p-4">
            <h2 className="text-h2 mb-4">المزيد</h2>
            
            {/* Cafe Info */}
            {(settings?.phone || settings?.address || settings?.openingHours) && (
              <div className="section-card mb-4">
                <div className="section-card-header">
                  <div className="section-card-title">
                    <div className="section-card-title-icon">
                      <Store className="w-4 h-4" />
                    </div>
                    معلومات المقهى
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
                          <div className="grouped-list-item-title">اتصل بنا</div>
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
                          <div className="grouped-list-item-title">العنوان</div>
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
                          <div className="grouped-list-item-title">أوقات العمل</div>
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
                  <div className="grouped-list-item-title">تسجيل دخول الإدارة</div>
                  <div className="grouped-list-item-subtitle">إدارة الطلبات والقائمة</div>
                </div>
                <ChevronLeft className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
            </button>

            {/* Display Settings */}
            <div className="settings-section mb-4">
              <div className="settings-section-header">
                <div className="settings-section-icon">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="settings-section-title">المظهر</div>
              </div>
              <div className="settings-section-body">
                <div className="settings-toggle">
                  <div>
                    <div className="settings-toggle-label">الوضع الداكن</div>
                    <div className="settings-toggle-description">تغيير مظهر التطبيق</div>
                  </div>
                  <div 
                    className={`settings-toggle-switch ${darkMode ? 'active' : ''}`}
                    onClick={() => setDarkMode(!darkMode)}
                  />
                </div>
              </div>
            </div>

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
                <div className="text-small text-[var(--text-muted)]">نظام إدارة المقهى</div>
                <div className="text-small text-[var(--text-muted)] mt-1">الإصدار 2.0.0</div>
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
            <span className="bottom-nav-label">الرئيسية</span>
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
            <span className="bottom-nav-label">السلة</span>
          </button>
          <button
            className={`bottom-nav-item ${customerTab === 'track' ? 'active' : ''}`}
            onClick={() => setCustomerTab('track')}
          >
            <div className="bottom-nav-icon">
              <Search className="w-5 h-5" />
            </div>
            <span className="bottom-nav-label">تتبع</span>
          </button>
          <button
            className={`bottom-nav-item ${customerTab === 'more' ? 'active' : ''}`}
            onClick={() => setCustomerTab('more')}
          >
            <div className="bottom-nav-icon">
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="bottom-nav-label">المزيد</span>
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
              <h2 className="dialog-title text-center w-full">✅ تم إرسال طلبك!</h2>
            </div>
            <div className="dialog-body text-center">
              <div className="order-success-icon mb-4">
                <Check className="w-12 h-12" />
              </div>
              
              <p className="text-body text-[var(--text-secondary)] mb-6">
                احتفظ بكود التتبع لمتابعة طلبك
              </p>
              
              <div className="order-code-display">
                <div className="order-code-label">كود التتبع</div>
                <div className="order-code-value">{lastOrderCode}</div>
              </div>
              
              <button
                className="btn btn-secondary w-full mt-4"
                onClick={copyTrackingCode}
              >
                <Download className="w-4 h-4" />
                نسخ الكود
              </button>
            </div>
            <div className="dialog-footer flex gap-3">
              <button
                className="btn btn-secondary flex-1"
                onClick={() => setShowOrderSuccess(false)}
              >
                إغلاق
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={goToTrackOrder}
              >
                متابعة الطلب
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
              <h2 className="dialog-title">تسجيل دخول الإدارة</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowLoginDialog(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="dialog-body space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="label">البريد الإلكتروني</label>
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
                <label className="label">كلمة المرور</label>
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
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    تسجيل الدخول
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
              <h2 className="dialog-title">تأكيد الطلب</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowOrderDialog(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="dialog-body">
              {/* Table Selection */}
              <div className="order-confirm-section">
                <div className="order-confirm-section-header">
                  <TableIcon className="w-4 h-4" />
                  <span>رقم الطاولة</span>
                  {isLoadingTablesStatus && <RefreshCw className="w-4 h-4 animate-spin text-[var(--text-muted)]" />}
                </div>
                {tables.length === 0 ? (
                  <div className="order-confirm-empty">
                    <AlertTriangle className="w-5 h-5" />
                    <span>لا توجد طاولات متاحة</span>
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
                        <span>الطاولات المحجوبة لديها طلبات جارية</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Order Summary */}
              <div className="order-confirm-section">
                <div className="order-confirm-section-header">
                  <ShoppingCart className="w-4 h-4" />
                  <span>الطلب</span>
                  <span className="order-items-count">{getSelectedProductsList().length} منتج</span>
                </div>
                <div className="order-items-list">
                  {getSelectedProductsList().map(({ product, quantity }) => (
                    <div key={product.id} className="order-item-row">
                      <div className="order-item-info">
                        <span className="order-item-name">{product.nameAr}</span>
                        <span className="order-item-price">{product.price} {currency}</span>
                      </div>
                      <div className="order-item-qty">×{quantity}</div>
                      <div className="order-item-total">{(product.price * quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="order-total-card">
                <span className="order-total-label">المجموع</span>
                <span className="order-total-value">{getOrderTotal().toFixed(2)} {currency}</span>
              </div>
            </div>
            {/* Footer with separated buttons */}
            <div className="order-confirm-actions">
              {/* Confirm Button - Top */}
              <button
                className="order-confirm-btn"
                onClick={submitOrder}
                disabled={!selectedTableId || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    <span>تأكيد الطلب</span>
                  </>
                )}
              </button>
              
              {/* Spacer */}
              <div className="order-btn-spacer"></div>
              
              {/* Cancel Button - Bottom */}
              <button
                className="order-cancel-btn"
                onClick={() => setShowOrderDialog(false)}
              >
                <X className="w-5 h-5" />
                <span>إلغاء</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
