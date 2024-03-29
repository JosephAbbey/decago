export function autoincremental(): number;
export function now(): Date;

export namespace t {
    export type ScalarType = number | string | boolean | Date;
    export type ScalarTypeObject =
        | Object<number, boolean | undefined>
        | Object<string, boolean | undefined>
        | Object<boolean, boolean | undefined>
        | Object<Date, boolean | undefined>;
    export type ScalarTypeString =
        | 'int'
        | 'float'
        | 'string'
        | 'boolean'
        | 'date';
    export type Type =
        | Object<any, boolean | undefined>
        | List<
              | Object<any, boolean | undefined>
              | Model<{
                    [key: string]: Type;
                }>
              | ModelPromise
          >
        | Model<{
              [key: string]: Type;
          }>
        | ModelPromise;

    // this is mad
    //#region infer<T>
    export type infer<T> = T extends Object<infer X, infer N>
        ? N extends boolean
            ? X | undefined
            : X
        : T extends List<infer Y>
        ? Y extends Object<infer X, infer N>
            ? X[]
            : Y extends Model<infer S, infer M>
            ? {
                  [key in keyof S]: S[key] extends Object<infer X, infer N>
                      ? N extends boolean
                          ? X | undefined
                          : X
                      : S[key] extends List<infer Y>
                      ? Y extends Object<infer X, infer N>
                          ? X[]
                          : Y extends Model<infer S, infer M>
                          ? {
                                [key in keyof S]: S[key] extends Object<
                                    infer X,
                                    infer N
                                >
                                    ? N extends boolean
                                        ? X | undefined
                                        : X
                                    : S[key] extends List<infer Y>
                                    ? Y extends Object<infer X, infer N>
                                        ? X[]
                                        : never
                                    : never;
                            }[]
                          : never
                      : never;
              }[]
            : never
        : T extends Model<infer S, infer M>
        ? M extends boolean
            ?
                  | {
                        [key in keyof S]: S[key] extends Object<
                            infer X,
                            infer N
                        >
                            ? N extends boolean
                                ? X | undefined
                                : X
                            : S[key] extends List<infer Y>
                            ? Y extends Object<infer X, infer N>
                                ? X[]
                                : Y extends Model<infer S, infer M>
                                ? {
                                      [key in keyof S]: S[key] extends Object<
                                          infer X,
                                          infer N
                                      >
                                          ? N extends boolean
                                              ? X | undefined
                                              : X
                                          : S[key] extends List<infer Y>
                                          ? Y extends Object<infer X, infer N>
                                              ? X[]
                                              : never
                                          : never;
                                  }[]
                                : never
                            : S[key] extends Model<infer S, infer M>
                            ? M extends boolean
                                ?
                                      | {
                                            [key in keyof S]: S[key] extends Object<
                                                infer X,
                                                infer N
                                            >
                                                ? N extends boolean
                                                    ? X | undefined
                                                    : X
                                                : S[key] extends List<infer Y>
                                                ? Y extends Object<
                                                      infer X,
                                                      infer N
                                                  >
                                                    ? X[]
                                                    : Y extends Model<
                                                          infer S,
                                                          infer M
                                                      >
                                                    ? {
                                                          [key in keyof S]: S[key] extends Object<
                                                              infer X,
                                                              infer N
                                                          >
                                                              ? N extends boolean
                                                                  ?
                                                                        | X
                                                                        | undefined
                                                                  : X
                                                              : S[key] extends List<
                                                                    infer Y
                                                                >
                                                              ? Y extends Object<
                                                                    infer X,
                                                                    infer N
                                                                >
                                                                  ? X[]
                                                                  : never
                                                              : never;
                                                      }[]
                                                    : never
                                                : never;
                                        }
                                      | undefined
                                : {
                                      [key in keyof S]: S[key] extends Object<
                                          infer X,
                                          infer N
                                      >
                                          ? N extends boolean
                                              ? X | undefined
                                              : X
                                          : S[key] extends List<infer Y>
                                          ? Y extends Object<infer X, infer N>
                                              ? X[]
                                              : Y extends Model<
                                                    infer S,
                                                    infer M
                                                >
                                              ? {
                                                    [key in keyof S]: S[key] extends Object<
                                                        infer X,
                                                        infer N
                                                    >
                                                        ? N extends boolean
                                                            ? X | undefined
                                                            : X
                                                        : S[key] extends List<
                                                              infer Y
                                                          >
                                                        ? Y extends Object<
                                                              infer X,
                                                              infer N
                                                          >
                                                            ? X[]
                                                            : never
                                                        : never;
                                                }[]
                                              : never
                                          : never;
                                  }
                            : never;
                    }
                  | undefined
            : {
                  [key in keyof S]: S[key] extends Object<infer X, infer N>
                      ? N extends boolean
                          ? X | undefined
                          : X
                      : S[key] extends List<infer Y>
                      ? Y extends Object<infer X, infer N>
                          ? X[]
                          : Y extends Model<infer S, infer M>
                          ? {
                                [key in keyof S]: S[key] extends Object<
                                    infer X,
                                    infer N
                                >
                                    ? N extends boolean
                                        ? X | undefined
                                        : X
                                    : S[key] extends List<infer Y>
                                    ? Y extends Object<infer X, infer N>
                                        ? X[]
                                        : never
                                    : never;
                            }[]
                          : never
                      : S[key] extends Model<infer S, infer M>
                      ? M extends boolean
                          ?
                                | {
                                      [key in keyof S]: S[key] extends Object<
                                          infer X,
                                          infer N
                                      >
                                          ? N extends boolean
                                              ? X | undefined
                                              : X
                                          : S[key] extends List<infer Y>
                                          ? Y extends Object<infer X, infer N>
                                              ? X[]
                                              : Y extends Model<
                                                    infer S,
                                                    infer M
                                                >
                                              ? {
                                                    [key in keyof S]: S[key] extends Object<
                                                        infer X,
                                                        infer N
                                                    >
                                                        ? N extends boolean
                                                            ? X | undefined
                                                            : X
                                                        : S[key] extends List<
                                                              infer Y
                                                          >
                                                        ? Y extends Object<
                                                              infer X,
                                                              infer N
                                                          >
                                                            ? X[]
                                                            : never
                                                        : never;
                                                }[]
                                              : never
                                          : never;
                                  }
                                | undefined
                          : {
                                [key in keyof S]: S[key] extends Object<
                                    infer X,
                                    infer N
                                >
                                    ? N extends boolean
                                        ? X | undefined
                                        : X
                                    : S[key] extends List<infer Y>
                                    ? Y extends Object<infer X, infer N>
                                        ? X[]
                                        : Y extends Model<infer S, infer M>
                                        ? {
                                              [key in keyof S]: S[key] extends Object<
                                                  infer X,
                                                  infer N
                                              >
                                                  ? N extends boolean
                                                      ? X | undefined
                                                      : X
                                                  : S[key] extends List<infer Y>
                                                  ? Y extends Object<
                                                        infer X,
                                                        infer N
                                                    >
                                                      ? X[]
                                                      : never
                                                  : never;
                                          }[]
                                        : never
                                    : never;
                            }
                      : never;
              }
        : never;
    //#endregion

    export class Object<
        T extends ScalarType,
        N extends boolean | undefined = undefined
    > {
        type: ScalarTypeString;
        constructor(type: ScalarTypeString);
        default: (data: T | (() => T)) => Object<T, N>;
        private _default?: T | (() => T);
        unique: () => Object<T, N>;
        private _unique?: boolean;
        nullable: () => Object<T, boolean>;
        private _nullable: N;
        id: () => Object<T, N>;
        private _id?: boolean;
    }

    export class List<
        T extends
            | ScalarTypeObject
            | Model<{
                  [key: string]: Type;
              }>
            | ModelPromise
    > {
        type: 'list';
        of: T;
        constructor(of: T);
    }
    export function listOf<
        T extends
            | ScalarTypeObject
            | Model<{
                  [key: string]: Type;
              }>
            | ModelPromise
    >(type: T): List<T>;

    export function int(): Object<number>;
    export function float(): Object<number>;
    export function string(): Object<string>;
    export function boolean(): Object<boolean>;
    export function date(): Object<Date>;

    export class Model<
        S extends {
            [key: string]: Type;
        },
        N extends boolean | undefined = undefined
    > {
        name: string;
        schema: S;
        private _nullable: N;
        constructor(name: string, schema: S);
        nullable(): Model<S, boolean>;
    }

    export class ModelPromise {
        public name: string;
        public model: Promise<Model<any>>;
        constructor(name: string);
    }
    export function ForwardDeclaration(name: string): ModelPromise; // Promise will resolve when a Model with the name is created
}
