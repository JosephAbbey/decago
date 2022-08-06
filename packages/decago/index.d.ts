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
        setInput: React.Dispatch<Parameters<T>[0]>;
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
        setInput: React.Dispatch<Parameters<T>[0]>;
    }
];

import { NextApiRequest, NextApiResponse } from 'next';

export class Cookies extends Map<string, string> {
    private req: NextApiRequest;
    private res: NextApiResponse;
    constructor(req: NextApiRequest, res: NextApiResponse);

    set(key: string, value: string): this;
}

export interface config {
    api?: {
        context?: (req: NextApiRequest, res: NextApiResponse) => Promise<any>;
    };
}
