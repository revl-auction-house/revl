import {
  runtimeMethod,
  runtimeModule,
  RuntimeModule,
  state,
} from "@proto-kit/module";
import { StateMap, assert } from "@proto-kit/protocol";
import { Bool, Field, Provable, PublicKey, Struct, UInt32 } from "o1js";

export class NFTKey extends Struct({
  collection: PublicKey,
  id: UInt32,
}) {
  public static from(collection: PublicKey, id: UInt32) {
    return new NFTKey({ collection, id });
  }
}

export class NFTEntity extends Struct({
  owner: PublicKey,
  metadata: Field, // ipfs hash
  locked: Bool,
}) {}

@runtimeModule()
export class NFT extends RuntimeModule<{}> {
  @state() public nftRecords = StateMap.from<NFTKey, NFTEntity>(
    NFTKey,
    NFTEntity
  );
  @state() public nonces = StateMap.from<PublicKey, UInt32>(PublicKey, UInt32);

  @runtimeMethod()
  public async mint(to: PublicKey, metadata: Field) {
    const minter = this.transaction.sender.value;
    const { value: minterNonce } = await this.nonces.get(minter);
    const key = NFTKey.from(minter, minterNonce);
    await this.nftRecords.set(
      key,
      new NFTEntity({ owner: to, metadata, locked: Bool(false) })
    );
    await this.nonces.set(minter, minterNonce.add(1));
  }

  @runtimeMethod()
  public async transferSigned(to: PublicKey, nftKey: NFTKey) {
    const { value: nft, isSome } = await this.nftRecords.get(nftKey);

    assert(isSome, "nft does not exists");
    // check if sender is the current owner
    assert(nft.owner.equals(this.transaction.sender.value), "Not owner of NFT");
    // check if the NFT is locked
    assert(nft.locked.not(), "NFT is locked and cannot be transferred");
    await this.transfer(to, nftKey);
  }

  public async transfer(to: PublicKey, key: NFTKey) {
    const { value: nft } = await this.nftRecords.get(key);
    await this.nftRecords.set(
      key,
      new NFTEntity({ ...nft, owner: to, locked: Bool(false) })
    );
  }

  public async lock(key: NFTKey) {
    const { value: nft } = await this.nftRecords.get(key);
    // lock the nft
    await this.nftRecords.set(key, new NFTEntity({ ...nft, locked: Bool(true) }));
  }

  public async unlock(key: NFTKey) {
    const { value: nft } = await this.nftRecords.get(key);
    // lock the nft
    await this.nftRecords.set(key, new NFTEntity({ ...nft, locked: Bool(false) }));
  }

  public async assertLocked(key: NFTKey) {
    const { value: nft } = await this.nftRecords.get(key);
    assert(nft.locked, "NFT is not locked");
  }

  public async assertUnLocked(key: NFTKey) {
    const { value: nft } = await this.nftRecords.get(key);
    assert(nft.locked.not(), "NFT is locked");
  }

  public async assertAddressOwner(key: NFTKey, address: PublicKey) {
    const { value: nft } = await this.nftRecords.get(key);
    assert(nft.owner.equals(address), "Not owner of NFT");
  }
}
