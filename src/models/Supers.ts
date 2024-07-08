import { Class, ExtractClass } from "../typings.js";
import { Design } from "./Design.js";

export class Supers<TClass extends readonly Class[]> {
  private _instances = new Map<Function, any>()

  constructor(private design: Design, private that: Record<string | symbol, unknown>) {}

  private _create<T extends ExtractClass<TClass>>(constructor: T): InstanceType<T> {
    const proxy = new Proxy(Reflect.construct(constructor, []), {
      get: (target, property) => {
        const descriptor = Reflect.getOwnPropertyDescriptor(target, property)

        if (typeof descriptor?.value === 'function') descriptor.value.bind(this.that)

        if (descriptor?.get) return descriptor.get.call(this.that)

        if (target[property] !== undefined) return target[property]

        const thatDescriptor = Reflect.getOwnPropertyDescriptor(this.that, property)

        if (thatDescriptor && thatDescriptor.value !== undefined) return thatDescriptor.value
      },
      set: (target, property, value) => {
        const descriptor = Reflect.getOwnPropertyDescriptor(target, property)

        if (descriptor?.set) descriptor?.set.call(this.that, value)

        target[property] = value

        return true
      },
    })

    return proxy
  }

  public for<T extends ExtractClass<TClass>>(constructor: T): InstanceType<T> {
    if (!this.design.has(constructor))

      throw new Error(`constructor must be a function but receive ${typeof constructor}`);

    if (this._instances.has(constructor))

      return this._instances.get(constructor)!

    const instance = this._create(constructor)

    this._instances.set(constructor, instance)

    return instance
  }

  public each<T>(fn: (target: InstanceType<ExtractClass<TClass>>) => T): T[] {
    return this.design.inheritances.slice().reverse().map((inherit: any) => {
      const target = this.for(inherit)

      return fn.call(target, target)
    })
  }
}
