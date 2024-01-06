export class Amount {
  constructor(public value: number) {
  }

  clone() {
    return new Amount(this.value);
  }

  subtract(amount: Amount) {
    this.value -= amount.value;
    return this;
  }

  add(amount: Amount) {
    this.value += amount.value;
    return this;
  }

  isUnderZero() {
    return this.value < 0;
  }

  static zero = () => new Amount(0);
}
