type Wait<T> = T extends Promise<infer X> ? X : T;

export function useQuery<T extends (input: any, context: any) => any>(
    query: T,
    input: Parameters<T>[0]
): [
    Wait<ReturnType<T>> | undefined,
    { isLoading: boolean; isError: boolean; again: () => void }
];

export function useMutation<T extends (input: any, context: any) => any>(
    mutation: T,
    input: Parameters<T>[0]
): [
    Wait<ReturnType<T>> | undefined,
    { isLoading: boolean; isError: boolean; again: () => void }
];
