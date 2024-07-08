import { Mix } from "../Mix.js";

describe('Mixed', () => {
  it('should extend a property of your trait', () => {
    class Trait {
      property = 'some trait property'
    }

    class Test extends Mix(Trait) {}

    expect(new Test().property).toBe('some trait property')
  })

  it('should extend a method of your trait', () => {
    const [method] = [jest.fn()]

    class Trait {
      method() { method() }
    }
  
    class Test extends Mix(Trait) {}

    new Test().method()

    expect(method).toHaveBeenCalled()
  })

  it('should override a property of your trait', () => {
    class Trait {
      property = 'some trait property'
    }

    class Test extends Mix(Trait) {
      override property: string = 'overwriting successfully'
    }

    expect(new Test().property).toBe('overwriting successfully')
  })

  it('should override your trait method', () => {
    const [traitMethod, method] = [jest.fn(), jest.fn()]

    class Trait { method() { traitMethod() } }
  
    class Test extends Mix(Trait) {
      override method(): void {
        method()
      }
    }

    new Test().method()

    expect(method).toHaveBeenCalled()
    expect(traitMethod).not.toHaveBeenCalled()
  })

  it('should be able to call your super with your trait method', () => {
    const [trait] = [jest.fn()]
    class Trait { method() { trait() } }
  
    class Test extends Mix(Trait) {
      override method(): void {
        super.method()
      }
    }

    new Test().method()
    expect(trait).toHaveBeenCalled()
  })

  it('should inherit the static properties of your trait', () => {
    class Trait {
      static property = 'some static property'
    }

    class Test extends Mix(Trait) {}

    expect(Test.property).toEqual('some static property')
  })

  it('should inherit static methods from your trait', () => {
    const [method] = [jest.fn()]

    class Trait {
      static method() { method() }
    }
  
    class Test extends Mix(Trait) {}

    Test.method()
    expect(method).toHaveBeenCalled()
  })

  describe('should be able to be an instance of multiple traits attached to it', () => {
    class Trait1 {}
    class Trait2 {}
    class Trait3 {}
    class Test extends Mix(Trait1, Trait2, Trait3) {}

    it.each([Trait1, Trait2, Trait3])('should be able to be an instance of the %p', (trait) => {
      expect(new Test()).toBeInstanceOf(trait)
    })
  })

  it('should be an instance of its own constructor', () => {
    class Trait {}
    class Test extends Mix(Trait) {}

    expect(new Test()).toBeInstanceOf(Test)
  })

  it('should be an instance of your trait', () => {
    class Trait {}
    class Test extends Mix(Trait) {}

    expect(new Test()).toBeInstanceOf(Trait)
  })

  it('it should be an instance of your trait even after setting the `Symbol.hasInstance`', () => {
    class Trait {}
    class Test extends Mix(Trait) {}
    class JustAUselessClass extends Mix(Test) {}

    expect(new Test()).toBeInstanceOf(Trait)
  })

  it('should be an instance of its own constructor even after defining `Symbol.hasInstance`', () => {
    class Trait {}
    class Test extends Mix(Trait) {}
    class JustAUselessClass extends Mix(Test) {}

    const instance = new Test()
    expect(instance).toBeInstanceOf(Test)
  })

  it('should be a trait instance of your trait', () => {
    class Trait {}
    class IntermediateTrait extends Mix(Trait) {}
    class Test extends Mix(IntermediateTrait) {}

    expect(new Test()).toBeInstanceOf(Trait)
  })

  describe('should be able to be an instance of yourself and other mixins and their traits at multiple levels', () => {
    class Trait1 {}
    class Trait2 {}
    class Trait3 {}
    class Trait4 {}
    class Trait5 {}
    class Trait6 {}
    class Trait7 {}
    class Trait8 {}
    class Trait9 {}
    class Trait10 {}

    class MiddleClass1 extends Mix(Trait1, Trait2) {}
    class MiddleClass2 extends Mix(MiddleClass1, Trait3, Trait4) {}
    class MiddleClass3 extends Mix(MiddleClass2, Trait5, Trait6) {}
    class MiddleClass4 extends Mix(MiddleClass3, Trait7, Trait8) {}

    class Test extends Mix(MiddleClass4, Trait9, Trait10) {}

    describe.each([
      [Trait1, [Trait1]],
      [Trait2, [Trait2]],
      [MiddleClass1, [Trait1, Trait2, MiddleClass1]],
      [MiddleClass2, [Trait1, Trait2, MiddleClass1, Trait3, Trait4, MiddleClass2]],
      [MiddleClass3, [Trait1, Trait2, MiddleClass1, Trait3, Trait4, MiddleClass2, Trait5, Trait6, MiddleClass3]],
      [MiddleClass4, [Trait1, Trait2, MiddleClass1, Trait3, Trait4, MiddleClass2, Trait5, Trait6, MiddleClass3, Trait7, Trait8, MiddleClass4]],
      [Test, [Trait1, Trait2, MiddleClass1, Trait3, Trait4, MiddleClass2, Trait5, Trait6, MiddleClass3, Trait7, Trait8, MiddleClass4, Trait9, Trait10, Test]]
    ])('an instance of %p', (constructor, mustBeInstance) => {
      it.each(mustBeInstance)('should be an instance of %p', (expected) => {
        expect(new constructor()).toBeInstanceOf(expected)
      })
      const mustNotBeAnInstance = [Trait1, Trait2, MiddleClass1, Trait3, Trait4, MiddleClass2, Trait5, Trait6, MiddleClass3, Trait7, Trait8, MiddleClass4, Trait9, Trait10, Test]
        .filter(mustNotBeAnInstance => !mustBeInstance.includes(mustNotBeAnInstance))
      if (mustNotBeAnInstance.length)
        it.each(mustNotBeAnInstance)('shouldn\'t be an instance %p', expected => {
          expect(new constructor()).not.toBeInstanceOf(expected)
        })
    })
  })

  it('should share a trait with multiple mixins', () => {
    class Trait {}
    class TestA extends Mix(Trait) {}
    class TestB extends Mix(Trait) {}
  
    expect(new TestA).toBeInstanceOf(Trait)
    expect(new TestB).toBeInstanceOf(Trait)
  })

  it('should inherit from your trait\'s trait', () => {
    const fn = jest.fn()
    class Trait {
      method() {
        fn()
      }
    }
    class IntermediateTrait extends Mix(Trait) {}
    class Test extends Mix(IntermediateTrait) {}

    new Test().method()
    expect(fn).toHaveBeenCalled()
  })

  it('should inherit from its trait its prototype methods and statics', () => {
    const [t1, t2, ts1, test] = [jest.fn(), jest.fn(), jest.fn(), jest.fn()]
    class Trait1 {
      static t1() { ts1() }
      t1() { t1() }
    }
  
    class Trait2 {
      t2() { t2() }
    }
  
    class Test extends Mix(Trait1, Trait2) {
      test() { test() }
    }
  
    const instance = new Test()
  
    Test.t1()
    instance.t1()
    instance.t2()
    instance.test()
  
    expect(ts1).toHaveBeenCalled()
    expect(t1).toHaveBeenCalled()
    expect(t2).toHaveBeenCalled()
    expect(test).toHaveBeenCalled()
  })

  it('should emerge a description with that of your trait', () => {
    class Trait1 {
      protected _text: string = 'some trait 1 text'
  
      public get text() {
        return this._text
      }
      public set text(text) {
        this._text = text
      }
    }
  
    class Trait2 {
      protected _text!: string
  
      public get text() {
        return `Trait2 text: ${this._text}`
      }
    }
  
    class Test extends Mix(Trait1, Trait2) {}
  
    const instance = new Test()
    expect(instance.text).toBe('Trait2 text: some trait 1 text')
    instance.text = 'some test text'
    expect(instance.text).toBe('Trait2 text: some test text')
  })

  it('should inherit prototype from your trait\'s inheritance', () => {
    class SomeClass {}
    class Trait extends SomeClass {}
    class Test extends Mix(Trait) {}
  
    expect(new Test()).toBeInstanceOf(SomeClass)
  })

  describe('should supers works', () => {
    it('supers forEach', () => {
      const [t1s, t2s, t3s] = [jest.fn(), jest.fn(), jest.fn()]
      class T1 {
        public setup() { t1s() }
      }
      class T2 {
        public setup() { t2s() }
      }
      class T3 extends Mix(T1, T2) {
        public setup(): void {
          this.supers.each(that => that.setup())
          t3s()
        }
      }
  
      const test = new T3()
  
      test.setup()
  
      expect(t1s).toHaveBeenCalled()
      expect(t2s).toHaveBeenCalled()
      expect(t3s).toHaveBeenCalled()
    })

    it('supers each', () => {
      const t1c = jest.fn(() => 1)
      const t2c = jest.fn(() => 2)
      const t3c = jest.fn((args: number[]) => 3)
      class T1 {
        public call() { return t1c() }
      }
      class T2 {
        public call() { return t2c() }
      }
      class T3 extends Mix(T1, T2) {
        public call() {
          return t3c(this.supers.each(proto => proto.call()))
        }
      }

      expect(t1c).not.toHaveBeenCalled()
      expect(t2c).not.toHaveBeenCalled()
      expect(t3c).not.toHaveBeenCalledWith([1, 2])

      new T3().call()
  
      expect(t1c).toHaveBeenCalled()
      expect(t2c).toHaveBeenCalled()
      expect(t3c).toHaveBeenCalledWith([1, 2])
    })

    it('supers persist super instance', () => {
      const t1c = jest.fn(() => 1)
      const t2c = jest.fn(() => 2)
      const t3c = jest.fn((args: number[]) => 3)

      class T1 {
        public call() { return t1c() }
      }
      class T2 {
        public call() { return t2c() }
      }
      class T3 extends Mix(T1, T2) {
        public call() {
          return t3c(this.supers.each(that => that.call()))
        }
      }

      const mixed = new T3()

      jest.spyOn(mixed.supers, '_create' as any)

      mixed.call()
      mixed.call()

      expect(mixed.supers['_create']).toHaveBeenCalledTimes(2)

      expect(t1c).toHaveBeenCalledTimes(2)
      expect(t2c).toHaveBeenCalledTimes(2)
      expect(t3c).toHaveBeenNthCalledWith(1, [1, 2])
      expect(t3c).toHaveBeenNthCalledWith(2, [1, 2])
    })

    it('supers set', () => {
      const t1k = Symbol.for('t1.value')
      const t2k = Symbol.for('t2.value')
      class T1 {
        private [t1k] = 0

        set value(value: number) { this[t1k] = value }
        get value() { return this[t1k] }
      }
      class T2 {
        private [t2k] = 0

        set value(value: number) { this[t2k] = value + 1 }
        get value() { return this[t2k] }
      }
      class T3 extends Mix(T1, T2) {
        setValue(value: number) {
          this.supers.each(that => that.value = value)
          return this
        }

        getValueBy(target: typeof T1 | typeof T2) {
          return this.supers.for(target).value
        }
      }

      expect(new T3().setValue(4).getValueBy(T1)).toBe(4)
      expect(new T3().setValue(4).getValueBy(T2)).toBe(5)
    })

    it('supers get property inside child instance', () => {
      abstract class T1 {
        public abstract value: number

        call() { return this.value }
      }

      class T2 extends Mix(T1) {
        public value: number = 5;
      }

      expect(new T2().supers.for(T1).call()).toBe(5)
    })

    describe('throw error on try super trait unqualified value type', () => {
      class T1 {}
      class T2 extends Mix(T1) {}

      it.each([null, undefined, 0, 'string', 123, Symbol('symbol'), {}])('trying on %p should throw the error', (attempt) => {
        expect(() => {
          new T2().supers.for(attempt as any)
        }).toThrowError()
      })
    })
  })

  it('should extends values attr from static properties', () => {
    class T1 {
      public static value = true
    }
    class T2 extends Mix(T1) {}

    expect(T2.value).toBeTruthy()
  })

  it('should extends values attr from static properties', () => {
    class T1 {
      public value!: boolean
    }

    T1.prototype.value = true

    class T2 extends Mix(T1) {}

    expect(new T2().value).toBeTruthy()
  })

  it('work with two abstract class', () => {
    abstract class T1<T extends object> {
      public vt1 = 'T1 Value'

      public nt1(): T {
        return this.t1()
      }

      public abstract t1(): T
    }

    abstract class T2 {
      public vt2 = 'T2 Value'

      public nt2(): unknown {
        return this.t2()
      }

      public abstract t2(): unknown
    }

    class T extends Mix(T1, T2) {
      t1() {
        return {}
      }
      t2(): unknown {
        throw new Error("Method not implemented.");
      }
}
  })

  it('', () => {
    interface EntityManager {}

    interface Repository<T> {
      findOne(options: FindOneOptions<T>): Promise<T | null>
    }

    interface FindOneOptions<T> {}

    class Ticket {}

    class AutomationFlowBlockServiceExecuteEvent {
      constructor(public readonly manager: EntityManager) {}
    }
    
    abstract class WithEntityTrait {
      public repository(): Repository<any> {
        return { findOne: () => Promise.resolve(null) }
        // return database.getRepository(this.getEntityTarget());
      }
    
      public async findOne(options: FindOneOptions<any>) {
        return await this.repository().findOne(options);
      }
    
      public abstract getEntityTarget(): abstract new (...args: any[]) => any;
    }
    
    abstract class AutomationFlowBlockService {
      public abstract onExecute(
        event: AutomationFlowBlockServiceExecuteEvent,
      ): unknown;
    }

    class AutomationFlowBlockServiceStartService extends Mix(
      AutomationFlowBlockService,
      WithEntityTrait,
    ) {
      public getEntityTarget() {
        return Ticket;
      }
    
      public onExecute(event: AutomationFlowBlockServiceExecuteEvent): unknown {
        throw new Error('Method not implemented.');
      }
    }
  })
})
