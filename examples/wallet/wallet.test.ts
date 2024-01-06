import { createMemory } from 'atoms';
import { Wallet } from './wallet.ts';
import { Amount } from './amount.ts';
import { assert, assertEquals, assertThrows } from 'asserts';

Deno.test('Wallet test', async () => {
  const { persist, restore, data } = createMemory();

  const wallet = new Wallet();

  wallet.credit(new Amount(100));
  wallet.credit(new Amount(100));

  assert(wallet.balance.value === 200);

  await persist(wallet);

  assertEquals(Array.from(data), [
    [
      '/tmp/' + wallet.identity,
      '{"identity":"' + wallet.identity + '","balance":{"value":200}}',
    ],
  ]);

  const restored = await restore(wallet.identity, Wallet);

  assert(restored.balance.value === 200);

  assertThrows(
    () => restored.debit(new Amount(350)),
    "Cannot credit this wallet, you don't have efficient amount",
  );
});
