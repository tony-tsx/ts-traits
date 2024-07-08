export type Class<TPrototype extends object = object, TArgs extends any[] = any[]> = abstract new (...args: TArgs) => TPrototype

export type ExtractClass<TClasses extends readonly Class[]> = TClasses extends readonly (infer TClass)[] ? TClass : never
