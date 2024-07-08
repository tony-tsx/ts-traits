import { Class } from "../typings.js";
import { Supers } from "./Supers.js";

export class Design {
  public static readonly designs = new Map<Function, Design>()

  public static for(target: Function, force: true): Design
  public static for(target: Function, force?: false): Design | null
  public static for(target: Function, force = false): Design | null {
    if (typeof target !== 'function') throw new Error(`target must be a function but receive ${typeof target}`);
    
    if (!Design.designs.has(target) && force) {
      const design = new this(target)

      Design.designs.set(target, design)
      Design.designs.set(design.class, design)
    }

    return Design.designs.get(target) ?? null
  }

  private static getOwnPropertyDescriptor(target: any, property: any): Partial<PropertyDescriptor> {
    const descriptor = Reflect.getOwnPropertyDescriptor(target, property) ?? {}

    return Object.fromEntries(
      Object.entries(descriptor).filter(([_, value]) => value !== undefined)
    )
  }

  public class: Class
  public inheritances: Class[] = []

  public has(trait: Function): boolean {
    if (this.class === trait) return true

    return this.inheritances.some(inherit => {
      if (trait === inherit) return true

      let constructor = inherit

      do {
        const design = Design.for(constructor)

        if (design) {
          if (design.has(trait)) return true
        }

        constructor = Reflect.getPrototypeOf(constructor) as Class
      } while(constructor !== Reflect.getPrototypeOf(function () {}))

      return false
    })
  }

  protected constructor(private target: Function) {
    const that = this

    this.class = (function (this: Record<string | symbol, unknown>, ...args: any[]) {
      that.inheritances.forEach(inheritance => {
        Object.assign(this, Reflect.construct(inheritance, args))
      })

      Object.assign(this, Reflect.construct(that.target, args))

      this.supers = new Supers(that, this)

      return this
    } as unknown as Class)

    Reflect.ownKeys(target).forEach(property => {
      if (property === 'prototype') return void 0

      const descriptor = Reflect.getOwnPropertyDescriptor(target, property)

      Reflect.defineProperty(
        this.class,
        property,
        descriptor ?? { value: (target as unknown as Record<string | symbol, unknown>)[property] }
      )
    })

    this.class.prototype = target.prototype

    const hasInstance = this.class[Symbol.hasInstance].bind(this.class)
    Object.defineProperty(this.class, 'name', { value: target.name })
    Object.defineProperty(this.class, Symbol.hasInstance, {
      value: (value: Record<string, unknown>) => {
        if (hasInstance(value)) return true

        let constructor = value.constructor
        do {
          const design = Design.for(constructor)

          if (design) {
            if (design.has(this.class)) return true
          }

          constructor = Reflect.getPrototypeOf(constructor) as Function
        } while (constructor !== Reflect.getPrototypeOf(function() {}))
      }
    })
  }

  private _use(trait: Class) {
    if (typeof trait !== 'function') throw new Error("TODO");

    do {
      const current = trait

      this.inheritances.push(current)

      Reflect.ownKeys(current).forEach((property) => {
        if (property === 'prototype') return void 0
  
        if (property === Symbol.for('isTrait')) return void 0
  
        const descriptor = Reflect.getOwnPropertyDescriptor(current, property)
  
        if (!descriptor && property in this.class) return void 0
  
        Reflect.defineProperty(this.class, property, {
          ...descriptor,
          ...Design.getOwnPropertyDescriptor(this.class, property)
        })
      })
  
      Reflect.ownKeys(current.prototype).forEach((property) => {
        if (property === 'constructor') return void 0
  
        const descriptor = Reflect.getOwnPropertyDescriptor(current.prototype, property)
  
        if (!descriptor && property in this.class.prototype) return void 0
  
        Reflect.defineProperty(this.class.prototype, property, {
          ...descriptor,
          ...Design.getOwnPropertyDescriptor(this.class.prototype, property)
        })
      })

      if (!(current as unknown as Record<symbol, unknown>)[Symbol.for('isTrait')]) {
        const hasInstance = current[Symbol.hasInstance].bind(current)
        Reflect.defineProperty(current, Symbol.for('isTrait'), { value: true, configurable: false, writable: false, enumerable: false })
        Reflect.defineProperty(current, Symbol.hasInstance, {
          value: (value: Record<string, unknown>) => {
            if (hasInstance(value)) return true

            let constructor = value.constructor

            do {
              const design = Design.for(constructor)

              if (design) {
                if (design.has(current)) return true
              }

              constructor = Reflect.getPrototypeOf(constructor) as Function
            } while(constructor !== Reflect.getPrototypeOf(function() {}))

            return false
          }
        })
      }

      trait = Reflect.getPrototypeOf(trait) as Class
    } while (trait !== Reflect.getPrototypeOf(function() {}))
  }

  public use(...traits: Class[]) {
    traits.forEach(this._use, this)
    return this
  }
}
