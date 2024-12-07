import {
  runtimeMethod,
  runtimeModule,
  RuntimeModule,
  state,
} from "@proto-kit/module";
import { StateMap, assert } from "@proto-kit/protocol";
import { Bool, Encoding, Field, Provable, PublicKey, Struct, UInt32 } from "o1js";

export class NFTKey extends Struct({
  collection: PublicKey,
  id: UInt32,
}) {
  public static from(collection: PublicKey, id: UInt32) {
    return new NFTKey({ collection, id });
  }
}

export class FixedString extends Struct({
  data: [Field, Field, Field, Field],
  length: UInt32,
}) {
  public static fromString(str: string) {
    const data = Encoding.stringToFields(str);
    if (data.length > 4) {
      throw new Error("String too long");
    }
    const padding = Array(4 - data.length).fill(Field(0));
    return new FixedString({ data: [...data, ...padding], length: new UInt32(data.length) });
  }

  public static from(
    data: [Field, Field, Field, Field],
    length: UInt32
  ) {
    return new FixedString({ data, length });
  }

  public toString() {
    return Encoding.stringFromFields(this.data.slice(0, Number(this.length.toBigint())));
  }
}

export class NFTEntity extends Struct({
  owner: PublicKey,
  metadata: FixedString, // ipfsHash,url, ...
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
  public async mint(to: PublicKey, metadata: FixedString) {
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
