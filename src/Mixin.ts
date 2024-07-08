import { Design } from "./models/Design.js"
import { Class } from "./typings.js"

export function Mixin(...traits: Class[]) {
  return <TFunction extends Class>(target: TFunction) => {
    return Design.for(target, true).use(...traits.reverse()).class as TFunction
  }
}
