export function autoincremental(): number;
export function now(): Date;

export namespace f {
    export type ScalarType = number | string | boolean | Date;
    export type ScalarTypeString =
        | 'int'
        | 'float'
        | 'string'
        | 'boolean'
        | 'date';
    export type Type =
        | Object<any>
        | List<Object<any> | Model | ModelPromise>
        | Model
        | ModelPromise;

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

    export class List<T extends Object<ScalarType> | Model | ModelPromise> {
        type: 'list';
        of: T;
        constructor(of: T);
    }
    export function listOf<T extends Object<ScalarType> | Model | ModelPromise>(
        type: T
    ): List<T>;

    export function int(): Object<number>;
    export function float(): Object<number>;
    export function string(): Object<string>;
    export function boolean(): Object<boolean>;
    export function date(): Object<Date>;

    export class Model {
        name: string;
        schema: {
            [key: string]: Type;
        };
        _nullable: boolean;
        constructor(name: string, schema: { [key: string]: Type });
        nullable(): this;
    }

    export class ModelPromise {
        public name: string;
        public model: Promise<Model>;
        constructor(name: string);
    }
    export function ForwardDeclaration(name: string): ModelPromise; // Promise will resolve when a Model with the name is created
}
