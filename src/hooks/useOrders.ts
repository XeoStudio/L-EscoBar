'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// جلب الطلبات
async function fetchOrders(status?: string, tableId?: string) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (tableId) params.set('tableId', tableId);
  
  const res = await fetch(`/api/orders?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

// جلب الطلبات مع polling
export function useOrders(options?: {
  status?: string;
  tableId?: string;
  refetchInterval?: number;
  enabled?: boolean;
}) {
  const { 
    status, 
    tableId, 
    refetchInterval = 1000,
    enabled = true 
  } = options || {};

  return useQuery({
    queryKey: ['orders', status, tableId],
    queryFn: () => fetchOrders(status, tableId),
    enabled,
    refetchInterval,
    staleTime: 0,
  });
}

// إنشاء طلب جديد مع optimistic update
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      tableId: string;
      tableNumber: number;
      items: { productId: string; quantity: number }[];
      notes?: string;
    }) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.details || error.error || 'فشل في إنشاء الطلب');
      }
      
      return res.json();
    },
    onSuccess: () => {
      // تحديث فوري للطلبات والطاولات
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables-status'] });
    },
  });
}

// تحديث حالة الطلب
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status 
    }: { 
      orderId: string; 
      status: string;
    }) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) throw new Error('فشل في تحديث الطلب');
      return res.json();
    },
    onMutate: async ({ orderId, status }) => {
      // Optimistic update - تحديث فوري في الواجهة
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      
      const previousOrders = queryClient.getQueryData(['orders']);
      
      queryClient.setQueryData(['orders'], (old: any[]) => 
        old?.map(order => 
          order.id === orderId ? { ...order, status } : order
        ) || []
      );
      
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      // إعادة الحالة السابقة عند الخطأ
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables-status'] });
    },
  });
}
