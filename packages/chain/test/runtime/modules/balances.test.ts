import { TestingAppChain } from "@proto-kit/sdk";
import { method, PrivateKey } from "o1js";
import { Balances, GAS_TOKEN_ID } from "../../../src/runtime/modules/balances";
import { log } from "@proto-kit/common";
import { Balance, BalancesKey, TokenId, UInt64 } from "@proto-kit/library";

log.setLevel("ERROR");

describe("balances", () => {
  it("should demonstrate how balances work", async () => {
    const appChain = TestingAppChain.fromRuntime({
      Balances,
    });

    appChain.configurePartial({
      Runtime: {
        Balances: {},
      },
    });

    await appChain.start();

    const alicePrivateKey = PrivateKey.random();
    const alice = alicePrivateKey.toPublicKey();

    appChain.setSigner(alicePrivateKey);

    const balances = appChain.runtime.resolve("Balances");

    const tx1 = await appChain.transaction(alice, async () => {
      await balances.addBalance(alice, UInt64.from(1000));
    });

    await tx1.sign();
    await tx1.send();
    const block1 = await appChain.produceBlock();

    let aliceBalance = await appChain.query.runtime.Balances.balances.get(
      BalancesKey.from(GAS_TOKEN_ID, alice)
    );

    expect(block1?.transactions[0].status.toBoolean()).toBe(true);
    expect(aliceBalance?.toBigInt()).toBe(1000n);

    // alice transfers 100 to someone
    const tx2 = await appChain.transaction(alice, async () => {
      await balances.transferSigned(
        GAS_TOKEN_ID,
        alice,
        PrivateKey.random().toPublicKey(),
        Balance.from(100)
      );
    });
    await tx2.sign();
    await tx2.send();
    let block = await appChain.produceBlock();
    expect(
      block?.transactions[0].status.toBoolean(),
      block?.transactions[0].statusMessage
    ).toBe(true);

    aliceBalance = await appChain.query.runtime.Balances.balances.get(
      BalancesKey.from(GAS_TOKEN_ID, alice)
    );
    expect(aliceBalance?.toBigInt()).toBe(900n);
  });
});
