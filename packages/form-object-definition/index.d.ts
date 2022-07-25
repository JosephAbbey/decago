export function autoincremental(): number;
export function now(): Date;

export namespace f {
    export type ScalarType = number | string | boolean | Date;
    export type ScalarTypeObject =
        | Object<number>
        | Object<string>
        | Object<boolean>
        | Object<Date>;
    export type ScalarTypeString =
        | 'int'
        | 'float'
        | 'string'
        | 'boolean'
        | 'date';
    export type Type =
        | Object<any>
        | List<
              | Object<any>
              | Model<{
                    [key: string]: Type;
                }>
              | ModelPromise
          >
        | Model<{
              [key: string]: Type;
          }>
        | ModelPromise;

    export type type<T> = T extends Object<infer X>
        ? X
        : T extends List<infer X>
        ? X
        : never;

    export type infer<T> = T extends Object<infer X>
        ? X
        : T extends List<infer Y>
        ? Y extends Object<infer X>
            ? X[]
            : Y extends Model<infer S>
            ? {
                  [key in keyof S]: S[key] extends Object<infer X>
                      ? X
                      : S[key] extends List<infer Y>
                      ? Y extends Object<infer X>
                          ? X[]
                          : never
                      : never;
              }[]
            : never
        : T extends Model<infer S>
        ? {
              [key in keyof S]: S[key] extends Object<infer X>
                  ? X
                  : S[key] extends List<infer Y>
                  ? Y extends Object<infer X>
                      ? X[]
                      : Y extends Model<infer S>
                      ? {
                            [key in keyof S]: S[key] extends Object<infer X>
                                ? X
                                : S[key] extends List<infer Y>
                                ? Y extends Object<infer X>
                                    ? X[]
                                    : never
                                : never;
                        }[]
                      : never
                  : S[key] extends Model<infer S>
                  ? {
                        [key in keyof S]: S[key] extends Object<infer X>
                            ? X
                            : S[key] extends List<infer Y>
                            ? Y extends Object<infer X>
                                ? X[]
                                : Y extends Model<infer S>
                                ? {
                                      [key in keyof S]: S[key] extends Object<
                                          infer X
                                      >
                                          ? X
                                          : S[key] extends List<infer Y>
                                          ? Y extends Object<infer X>
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

    export class Object<T extends ScalarType> {
        type: ScalarTypeString;
        constructor(type: ScalarTypeString);
        default: (data: T | (() => T)) => this;
        _default?: T | (() => T);
        unique: () => this;
        _unique?: boolean;
        nullable: () => this;
        _nullable?: boolean;
        id: () => this;
        _id?: boolean;
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
        }
    > {
        name: string;
        schema: S;
        _nullable: boolean;
        constructor(name: string, schema: S);
        nullable(): this;
    }

    export class ModelPromise {
        public name: string;
        public model: Promise<Model<any>>;
        constructor(name: string);
    }
    export function ForwardDeclaration(name: string): ModelPromise; // Promise will resolve when a Model with the name is created
}
