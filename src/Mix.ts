import { Mixin } from "./Mixin.js";
import { MIXED_ID } from "./constants.js";
import { Supers } from './models/Supers.js';
import { Class } from "./typings.js";

type _MixClass<
  T extends readonly any[],
  TStatic extends { prototype: unknown } = { prototype: {} },
  TPrototype = {},
  TArgs extends any[] = any[],
  TClass extends readonly Class[] = T
> = 
  T extends readonly [infer T1, ...infer TR]
    ? T1 extends Class<infer TClassPrototype, infer TClassArgs>
      ? _MixClass<TR, TStatic & T1, TPrototype & TClassPrototype, TArgs, TClass>
      : never
    : TStatic & (new (...args: TArgs) => TStatic['prototype'] & TPrototype & ({ readonly supers: Supers<TClass> }))

let counter = 0

export type MixClass<T extends readonly [Class, ...Class[]]> = _MixClass<T>

export function Mix<T extends readonly [Class, ...Class[]]>(...traits: T): _MixClass<T> {
  @Mixin(...traits)
  class Mixed {
    private static [MIXED_ID] = ++counter
  }

  return Mixed as unknown as _MixClass<T>
}

Mix.cast = <T extends object>(trait: Class<any, any>): Class<T> => trait
