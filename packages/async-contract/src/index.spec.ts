import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
const expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

import Contract from './';

const sleep = (ms: number) =>
  new Promise<boolean>(resolve => setTimeout(() => resolve(true), ms));
const range = (n: number) => [...Array(n).keys()];

describe('async-contract test suite', () => {
  it('should be able send on events', () => {
    const contract = new Contract<number>(async resolve => {
      await sleep(100);
      resolve(1);
    });

    return contract.on(value => {
      value.should.equal(1, 'value should be 1');
    });
  });

  it('should be able send on events with a then chained', () => {
    const contract = new Contract<number>(async resolve => {
      await sleep(100);
      resolve(1);
    });

    return contract
      .on(value => {
        value.should.equal(1, 'value should be 1');
        return value * 10;
      })
      .should.eventually.deep.equal([10], 'data should be [10]');
  });

  it('should be able send a then event', () => {
    const contract = new Contract<number>(async resolve => {
      await sleep(100);
      resolve(1);
    });

    return Promise.all([
      contract
        .on(value => {
          value.should.equal(1, 'value should be 1');
          return value * 10;
        })
        .should.eventually.deep.equal([10], 'data should be [10]'),

      contract.should.eventually.deep.equal([1], 'data should be [1]'),
    ]);
  });

  it('should be able to handle multiple emits and a resolve', () => {
    const count = 10;
    const contract = new Contract<number>(async (resolve, emit) => {
      for (let i = 1; i < count; i++) {
        await sleep(100);
        emit(i);
      }
      await sleep(100);
      resolve(count);
    });

    let i = 1;
    return Promise.all([
      contract
        .on(value => {
          value.should.equal(i++);
          return value * 10;
        })
        .should.eventually.deep.equal(range(count).map(i => (i + 1) * 10)),

      contract.should.eventually.deep.equal(range(count).map(i => i + 1)),
    ]);
  });

  it('should work for only emitting on an event handler', () => {
    const count = 10;

    class Element {
      _onclick: () => void = () => {};

      click() {
        this._onclick();
      }

      onclick(fn: () => void) {
        this._onclick = fn;
      }
    }

    const element = new Element();

    let u: ((value: boolean) => void) | undefined = undefined;
    const subscribed = Promise.race([
      new Promise<boolean>(resolve => (u = resolve)),
      sleep(1900),
    ]);
    const contract = new Contract<number>(
      async (resolve, emit, reject, onStop) => {
        element.onclick(() => emit(Date.now()));
        onStop(() => {
          // could unsubscribe listener here

          if (u) u(false);
        });
      }
    );

    // click the element `count` times with between 0 and 100ms delay
    const r = (i = 0) =>
      i < count
        ? sleep(~~(Math.random() * 100)).then(() => {
            element.click();
            r(i + 1);
          })
        : // stop the contract after the `count` clicks
          sleep(~~(Math.random() * 100)).then(() => contract.stop());
    r();

    return Promise.all([
      contract
        .on(value => {
          value.should.be.a('number');
          value.should.be.within(
            Date.now() - 20,
            Date.now(),
            'value should be within 20ms of now'
          );
          return value;
        })
        .should.eventually.have.lengthOf(
          count,
          'did not emit the correct number of times'
        ),
      expect(subscribed, 'did not subscribe').to.eventually.be.false,
    ]);
  });
});
