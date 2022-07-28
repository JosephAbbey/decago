type Wait<T> = T extends Promise<infer X> ? X : T;

export function useQuery<T extends (input: any, context: any) => any>(
    query: T,
    input: Parameters<T>[0]
): [
    Wait<ReturnType<T>> | undefined,
    {
        isLoading: boolean;
        isError: boolean;
        again: () => void;
        setInput: React.Dispatch<any>;
    }
];

export function dispatchMutation<T extends (input: any, context: any) => any>(
    mutation: T,
    input: Parameters<T>[0]
): ReturnType<T>;

export function useMutation<T extends (input: any, context: any) => any>(
    mutation: T,
    input: Parameters<T>[0]
): [
    Wait<ReturnType<T>> | undefined,
    {
        isLoading: boolean;
        isError: boolean;
        again: () => void;
        setInput: React.Dispatch<any>;
    }
];

import { NextApiRequest, NextApiResponse } from 'next';

export class Cookies extends Map<string, string> {
    private req: NextApiRequest;
    private res: NextApiResponse;
    constructor(req: NextApiRequest, res: NextApiResponse);

    set(key: string, value: string): this;
}
