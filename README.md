# Concept

Simple as simple, easy to test framework.

Just two methods restore and persist and one interface IAtom.


#### Example code:

```ts
	const {persist, restore} = createMemory();

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

		static deserialize(
			value: PropertiesOnly<MySecondClass>,
		): MySecondClass {
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