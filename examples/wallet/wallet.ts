import { Atom, PropertiesOnly } from 'atoms';
import { Amount } from './amount.ts';

export class Wallet extends Atom<Wallet> {
  public balance: Amount = Amount.zero();

  debit(amount: Amount) {
    if (this.balance.clone().subtract(amount).isUnderZero()) {
      throw new Error(
        "Cannot credit this wallet, you don't have efficient amount",
      );
    }
    this.balance.subtract(amount);
  }

  credit(amount: Amount) {
    this.balance.add(amount);
  }

  static deserialize(rawValue: PropertiesOnly<Wallet>) {
    return Object.assign(
      new Wallet(),
      rawValue,
      { balance: Amount
        .zero()
        .add(
          new Amount(rawValue.balance.value),
        ) 
      },
    );
  }
}
