type openContract<T> = {
  resolve: (value: T) => void;
  emit: (value: T) => void;
  reject: (reason: unknown) => void;
};

class Empty {}

export default class Contract<T> extends Promise<T[]> {
  data: T[] = [];
  private _onContracts: openContract<[T | Empty, T[]]>[] = [];

  stop = () => {};
  private _stopCallbacks: (() => void)[] = [];

  constructor(
    executor: (
      resolve: (value: T | Empty | PromiseLike<T>) => void,
      emit: (value: T | PromiseLike<T>) => void,
      reject: (reason: unknown) => void,
      onStop: (fn: () => void) => void
    ) => void
  ) {
    let a = false;
    const A: (() => void)[] = [];
    let r: () => void = () => {};
    super((resolve, reject) => {
      r = () => {
        this._stopCallbacks.forEach(fn => fn());
        this._onContracts.forEach(c => {
          c.resolve([new Empty(), this.data]);
        });
        resolve(this.data);
      };
      return executor(
        async (value: T | Empty | PromiseLike<T>) => {
          const v: Awaited<T | Empty | PromiseLike<T>> = await value;
          if (!(v instanceof Empty)) this.data.push(v);
          this._stopCallbacks.forEach(fn => fn());
          this._onContracts.forEach(c => {
            c.resolve([v, this.data]);
          });
          resolve(this.data);
        },
        async (value: T | PromiseLike<T>) => {
          const v: Awaited<T | PromiseLike<T>> = await value;
          this.data.push(v);
          this._onContracts.forEach(c => {
            c.emit([v, this.data]);
          });
        },
        (reason: unknown) => {
          this._stopCallbacks.forEach(fn => fn());
          this._onContracts.forEach(c => {
            c.reject(reason);
          });
          reject(reason);
        },
        (fn: () => void) => {
          if (!a) A.push(fn);
          else this._stopCallbacks.push(fn);
        }
      );
    });
    a = true;
    this._stopCallbacks.push(...A);
    this.stop = r;
  }

  static get [Symbol.species]() {
    return Promise;
  }

  on<F>(fn: (value: T, data: T[]) => F) {
    return new Contract<F>((resolve, emit, reject) => {
      this._onContracts.push({
        resolve: ([v, data]: [T | Empty, T[]]) =>
          v instanceof Empty ? resolve(v) : resolve(fn(v, data)),
        emit: ([v, data]: [T | Empty, T[]]) =>
          !(v instanceof Empty) && emit(fn(v, data)),
        reject,
      });
    });
  }
}
