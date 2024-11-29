import { runtimeModule, state, runtimeMethod } from "@proto-kit/module";
import { State, assert } from "@proto-kit/protocol";
import { Balance, Balances as BaseBalances, TokenId } from "@proto-kit/library";
import { PublicKey } from "o1js";

export const GAS_TOKEN_ID = TokenId.from(0);

@runtimeModule()
export class Balances extends BaseBalances<{}> {
  @state() public circulatingSupply = State.from<Balance>(Balance);

  public constructor() {
    super();
  }

  @runtimeMethod()
  public async addBalance(address: PublicKey, amount: Balance) {
    const circulatingSupply = await this.circulatingSupply.get();
    const newCirculatingSupply = Balance.from(circulatingSupply.value).add(
      amount
    );
    await this.circulatingSupply.set(newCirculatingSupply);

    await this.mint(GAS_TOKEN_ID, address, amount);
  }

  public async transferFrom(from: PublicKey, to: PublicKey, amount: Balance) {
    await this.transfer(GAS_TOKEN_ID, from, to, amount);
  }
}
