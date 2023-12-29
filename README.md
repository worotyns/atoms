# Concept

## What?
Simple as objects and easy to prototype micro "framework".
Just two methods: *restore* and *persist* and one interface to implements *IAtom*.

## Why?
I need to write small programs without complexity. I need to declare one class, and interact with it.
I can persist my state or restore when I need, without any databases. In FS i can preview my data and query with `jq` or similar tools.

Imagine that you can write wallet like:
```ts
class Wallet {
    private readonly balance: Amount = Amount.zero()

    debit(amount: Amount) {
        this.balance.subtract(amount)
    }

    credit(amount: Amount) {
        if (this.balance.clone().add(amount).isUnderZero()) {
            throw new Error('Cannot credit this wallet, you don\'t have efficient amount')
        }
        this.balance.add(amount)
    }
}

```

And then when I need to use it i just add `extends Atom {` to class implementation and write deserializer. If my data grows and object data goes to be more complex. I can wrap nested properties class with Atom also, and store in separated files on fs.

So finally you have:

```ts
class Wallet extends Atom<Wallet> {

    private readonly balance: Amount = Amount.zero()

    debit(amount: Amount) {
        this.balance.subtract(amount)
    }

    credit(amount: Amount) {
        if (this.balance.clone().add(amount).isUnderZero()) {
            throw new Error('Cannot credit this wallet, you don\'t have efficient amount')
        }
        this.balance.add(amount)
    }

    static deserialize(value: PropertiesOnly<Wallet>) {
        return Object.assign(
            new Wallet(), 
            Atom.parse<Wallet>(value)
        );
    }
}
```

### What is included?
Drivers:
 - memory
 - file system
 - object storage (inprogress)
 - deno kv (in progress)

Serializers:
 - json

### Example codes:

##### Simple structure - one file

```ts
const {persist, restore} = createMemory();

// Define your model
class Simple extends Atom<MySample> {

    public readonly name: string = 'example';
    public readonly age: number = 33;

    public sayNameAndAge() {
        return `${this.name} is ${age} yo`
    }

    static deserialize(value: PropertiesOnly<MySample>): MySample {
        return Object.assign(
            new MySample(), 
            Atom.parse<MySample>(value)
        );
    }
}

// Create instance
const mySample = new MySample();

// Save
await persist(mySample);

// Restore from FS
const restored = await restore(mySample.identity, MySample);
```

##### Nested sturctures (each of structure is persisted in separate file)

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

Thats all