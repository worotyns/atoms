import { Atom, createFs, PropertiesOnly } from 'https://deno.land/x/atoms@0.0.2/mod.ts';

const {persist, restore} = createFs('./data');

class Amount {
    constructor(public value: number) {

    }

    clone() {
        return new Amount(this.value)
    }

    subtract(amount: Amount) {
        this.value -= amount.value
        return this;
    }

    add(amount: Amount) {
        this.value += amount.value
        return this;
    }

    isUnderZero() {
        return this.value < 0;
    }

    static zero = () => new Amount(0);
}

class Wallet extends Atom<Wallet> {
    public readonly balance: Amount = Amount.zero()

    debit(amount: Amount) {
        if (this.balance.clone().subtract(amount).isUnderZero()) {
            throw new Error('Cannot credit this wallet, you don\'t have efficient amount')
        }
        this.balance.subtract(amount)
    }

    credit(amount: Amount) {
        this.balance.add(amount)
    }

    static deserialize(value: PropertiesOnly<Wallet>) {
        const parsed = Atom.parse<Wallet>(value);
        
        return Object.assign(
            new Wallet(), 
            parsed,
            {balance: Amount.zero().add(parsed.balance)}
        );
    }
}

const wallet = new Wallet();

wallet.credit(new Amount(100));
wallet.credit(new Amount(100));

console.log(wallet.balance.value) // 200

await persist(wallet); // persist to ./data/<identity>

// restore from ./data/<identity>
const restored = await restore(wallet.identity, Wallet);
console.log(restored.balance.value) // 200

try {
    restored.debit(new Amount(350)); // throws
} catch(error) {
    console.log(error.message); // throws business logic error
}
