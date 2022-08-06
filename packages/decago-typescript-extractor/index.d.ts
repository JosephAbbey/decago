import { CompilerOptions } from 'typescript';

export default function extract(
    file: string,
    operations: (data: string) => string,
    compilerOptions?: CompilerOptions
): Promise<any>;
