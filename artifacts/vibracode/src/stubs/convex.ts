export function useQuery(...args: any[]) { return undefined; }
export function useMutation(...args: any[]) { return async (...a: any[]) => {}; }
export function useAction(...args: any[]) { return async (...a: any[]) => {}; }
export function usePaginatedQuery(...args: any[]) { return { results: [], status: 'Exhausted', loadMore: () => {} }; }
