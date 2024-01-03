import { assertEquals } from 'https://deno.land/std@0.210.0/assert/assert_equals.ts';

import { Atom } from './atom.ts';
import { PropertiesOnly } from './interfaces.ts';
import { createMemory } from './storage/factory.ts';

Deno.test('Serialize / deserialize test', async () => {
  class MySample extends Atom<MySample> {
    public readonly name: string = 'mati';
    public readonly age: number = 33;
    public collection: Array<number> = [1, 2, 3, 4];
    public mySet: Set<MySecondClass> = new Set([
      new MySecondClass(),
    ]);
    public myMap: Map<string, MySecondClass> = new Map([
      ['first', new MySecondClass()],
      ['second', new MySecondClass()],
    ]);
    public nested: MySecondClass = new MySecondClass();
    public nestedCollection: MySecondChildClass[] = [
      new MySecondChildClass(),
      new MySecondChildClass(),
    ];

    static deserialize(value: PropertiesOnly<MySample>): MySample {
      const temporary = Atom.parse<MySample>(value);
      const newSample = new MySample();
      Object.assign(newSample, temporary, {
        nested: MySecondClass.deserialize(temporary.nested),
        nestedCollection: temporary.nestedCollection.map((item) =>
          MySecondChildClass.deserialize(item)
        ),
        mySet: new Set(
          Array.from(temporary.mySet).map((item) =>
            MySecondClass.deserialize(item)
          ),
        ),
        myMap: new Map(
          Array.from(temporary.myMap).map((
            [key, value],
          ) => [key, MySecondClass.deserialize(value)]) as Array<
            [string, MySecondClass]
          >,
        ),
      });

      return newSample;
    }
  }

  class MySecondClass extends Atom<MySecondClass> {
    public collection: Array<number> = [1, 2, 3, 4];

    static deserialize(
      value: PropertiesOnly<MySecondClass>,
    ): MySecondClass {
      const temporary = Atom.parse(value);
      const newSample = new MySecondClass();
      Object.assign(newSample, temporary);
      return newSample;
    }
  }

  class MySecondChildClass extends Atom<MySecondClass> {
    public readonly justName: string = `JustName: ${
      Math.random().toString(36).slice(3)
    }`;

    static deserialize(
      value: PropertiesOnly<MySecondChildClass>,
    ): MySecondChildClass {
      const temporary = Atom.parse(value);
      const newSample = new MySecondChildClass();
      Object.assign(newSample, temporary);
      return newSample;
    }
  }

  const mySample = new MySample();

  const { persist, restore } = createMemory();

  await persist(mySample);
  const restored = await restore(mySample.identity, MySample);

  assertEquals(restored, mySample);
});
