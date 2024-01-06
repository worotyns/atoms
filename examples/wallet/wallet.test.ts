import { createMemory } from 'atoms';
import { Wallet } from './wallet.ts';
import { Amount } from './amount.ts';
import { assert, assertThrows } from 'asserts';

Deno.test('Wallet test', async () => {

    const { persist, restore } = createMemory();

    const wallet = new Wallet();
    
    wallet.credit(new Amount(100));
    wallet.credit(new Amount(100));
    
    assert(wallet.balance.value === 200);
    
    await persist(wallet);
    
    const restored = await restore(wallet.identity, Wallet);

    assert(restored.balance.value === 200);
    
    assertThrows(() => restored.debit(new Amount(350)), "Cannot credit this wallet, you don't have efficient amount");
})