# Atoms

## Overview

Atoms is a simple and lightweight micro "framework" designed for easy
prototyping and interaction with objects. It consists of just two methods,
_restore_ and _persist_, and an interface to implement _IAtom_.

## Features

- **Simplicity:** Define your classes with just two methods, making it easy to
  create small programs without unnecessary complexity.

- **Persistence:** Easily persist and restore the state of your objects without
  the need for databases. Use the file system to preview data and query with
  tools like `jq` or similar.

- **Extensibility:** Implement the _IAtom_ interface by extending the _Atom_
  class to enable seamless serialization and deserialization.

- **Drivers:** Includes drivers for memory, file system, object storage (in
  progress), and Deno KV storage (in progress).

- **Serializers:** Currently supports JSON serialization.

## Example Codes (see /examples directory)

### Simple Structure (One File)

```typescript
import { Atom, createFs } from 'https://deno.land/x/atoms/mod.ts';

const { persist, restore } = createFs('./tmp');

class Simple extends Atom<Simple> {
  public readonly name: string = 'example';
  public readonly age: number = 33;

  sayNameAndAge() {
    return `${this.name} is ${this.age} yo`;
  }

  static deserialize(value: PropertiesOnly<Simple>): Simple {
    return Object.assign(
      new Simple(),
      Atom.parse<Simple>(value),
    );
  }
}

const simple = new Simple();
await persist(simple);
const restored = await restore(simple.identity, Simple);
```

## Nested structure (multiple files on save)

```ts
import { Atom, createFs } from 'https://deno.land/x/atoms/mod.ts';

const { persist, restore } = createFs('./tmp');

class MySample extends Atom<MySample> {
  public readonly name: string = 'example';
  public readonly age: number = 33;
  public nested: MySecondClass = new MySecondClass();

  static deserialize(value: PropertiesOnly<MySample>): MySample {
    const temporary = Atom.parse<MySample>(value);
    const newSample = new MySample();

    Object.assign(newSample, temporary, {
      nested: MySecondClass.deserialize(temporary.nested),
    });

    return newSample;
  }
}

class MySecondClass extends Atom<MySecondClass> {
  public collection: Array<number> = [1, 2, 3, 4];

  static deserialize(value: PropertiesOnly<MySecondClass>): MySecondClass {
    const temporary = Atom.parse(value);
    const newSample = new MySecondClass();

    Object.assign(newSample, temporary);
    return newSample;
  }
}

const mySample = new MySample();
await persist(mySample);
const restored = await restore(mySample.identity, MySample);
```
