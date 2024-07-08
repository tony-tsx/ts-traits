# Typesript Traits

![GitHub package.json version](https://img.shields.io/github/package-json/v/tony-tsx/ts-traits?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/tony-tsx/ts-traits?style=for-the-badge)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tony-tsx/ts-traits/ci.yml?branch=main&label=CI&style=for-the-badge)

Typesript Traits is a lib that, as its name says, creates our beloved traits, helping to improve the syntax of our class.

## Installation

```sh
npm install @prunus/mixin
```

or

```sh
yarn add @prunus/mixin
```

---

## Usage

### **The best way:**

This is the purpose of this lib, to give readability to your code in a clean way and with little code. This, along with the __typescript [mixin](https://www.typescriptlang.org/docs/handbook/mixins.html) feature__, makes it even more exciting as they complement each other extremely well.

```ts
import { Mix } from '@prunus/mixin'

class Trait1 {}
class Trait2 {}

class Class extends Mix(Trait1, Trait2) {}
```

Or

```ts
import { Mixin } from '@prunus/mixin'

class Trait1 {}
class Trait2 {}

@Mixin(Trait1, Trait2)
class Class {}

interface Class extends Trait1, Trait2 {}
```

Test! Write some properties of your traits and your class and watch the magic happen.

### **The not so good way:**

We certainly do not encourage you to do this, but it is a feature that could not be left out, due to some specific needs that the developer may have.

```ts
import { Mixin } from '@prunus/mixin'

class Trait1 {}

class Trait2 {}

class TestClass {}

const Test: TestConstructor = Mixin(Trait1, Trait2)(TestClass)

interface TestClass extends Trait1, Trait2 {}
interface TestConstructor {
  new (): TestClass
}
```

As you can see in this way, we lose readability, it can make the code confusing depending on how complex our trait or class code is, even separating it into files... But it works, so your imagination is the limit.

### Supers

We haven't forgotten about the overlay, and we never will, that's why we remember our super. Unfortunately we can't fight js for the position of `super` inside the class, but it is a property of our `this.supers`.

```ts
import { Mix } from '@prunus/mixin'

class Trait {
  say() {
    console.log('Hello world i\'am a trait')
  }
}

class Class extends Mix(Trait) {
  say() {
    this.supers.for(Trait).say()

    console.log('Hello world i\'am a mixin')
  }
}

```

---

### All instanceof instructions working correctly

In your code you can check if that instance of your dear mix is an instance of some other class within the mix. Example:

```ts
import { Mix } from '@prunus/mixin'

class Trait1 {}

class Trait2 {}

class Trait3 {}

class Class1 extends Mix(Trai1, Trait3)

class Class2 extends Mix(Trait1, Trait2) {}

console.log(new Class2() instanceof Trait1) // true
console.log(new Class2() instanceof Trait2) // true
console.log(new Class2() instanceof Trait3) // false
console.log(new Class2() instanceof Class1) // false
console.log(new Class1() instanceof Trait3) // true
console.log(new Class1() instanceof Trait1) // false
console.log(new Class1() instanceof Trait2) // false
console.log(new Class1() instanceof Class2) // false
```
