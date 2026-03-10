'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

// أنواع البيانات
interface TableStatus {
  id: string;
  number: number;
  seats: number;
  description: string | null;
  active: boolean;
  isOccupied: boolean;
  currentOrder: {
    tableId: string;
    status: string;
    orderCode: string;
    createdAt: string;
  } | null;
}

// جلب حالة الطاولات
async function fetchTablesStatus(): Promise<TableStatus[]> {
  const res = await fetch('/api/tables/status', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch tables');
  return res.json();
}

// Hook لحالة الطاولات مع polling محسن
export function useTableStatus(options?: { 
  enabled?: boolean;
  refetchInterval?: number;
}) {
  const { enabled = true, refetchInterval = 500 } = options || {};
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tables-status'],
    queryFn: fetchTablesStatus,
    enabled,
    refetchInterval,
    staleTime: 0, // دائماً جلب بيانات جديدة
  });

  // إنشاء Set للطاولات المشغولة
  const occupiedTables = new Set(
    query.data?.filter(t => t.isOccupied).map(t => t.id) || []
  );

  // قائمة الطاولات
  const tables = query.data?.map(t => ({
    id: t.id,
    number: t.number,
    seats: t.seats,
    description: t.description,
    active: t.active,
  })) || [];

  // إعادة جلب فورية
  const refetch = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['tables-status'] });
  }, [queryClient]);

  return {
    tables,
    tablesWithStatus: query.data || [],
    occupiedTables,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch,
  };
}

// Hook للطاولات المشغولة فقط (أسرع)
export function useOccupiedTables() {
  const { occupiedTables, isFetching } = useTableStatus();
  return { occupiedTables, isFetching };
}

// تحديث فوري بعد إنشاء طلب
export function useRefreshTablesOnOrder() {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    // تحديث فوري بدون انتظار
    queryClient.invalidateQueries({ queryKey: ['tables-status'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  }, [queryClient]);
}
