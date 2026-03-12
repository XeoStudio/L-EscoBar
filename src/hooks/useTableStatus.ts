'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

// Data types
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

// Fetch table status
async function fetchTablesStatus(): Promise<TableStatus[]> {
  const res = await fetch('/api/tables/status', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch tables');
  return res.json();
}

// Table status hook with optimized polling
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
    staleTime: 0, // Always fetch fresh data
  });

  // Build a set of occupied table IDs
  const occupiedTables = new Set(
    query.data?.filter(t => t.isOccupied).map(t => t.id) || []
  );

  // Flatten tables list
  const tables = query.data?.map(t => ({
    id: t.id,
    number: t.number,
    seats: t.seats,
    description: t.description,
    active: t.active,
  })) || [];

  // Immediate refetch helper
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

// Hook for occupied tables only (faster)
export function useOccupiedTables() {
  const { occupiedTables, isFetching } = useTableStatus();
  return { occupiedTables, isFetching };
}

// Immediate refresh after creating an order
export function useRefreshTablesOnOrder() {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    // Refresh immediately without waiting
    queryClient.invalidateQueries({ queryKey: ['tables-status'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  }, [queryClient]);
}
