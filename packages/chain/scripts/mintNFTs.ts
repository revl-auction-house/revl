import process from 'process';
import { client } from '../src/environments/client.config';
import { PrivateKey, Encoding, Field } from "o1js"
import { Buffer } from 'buffer';
import { FixedString } from '../src/runtime/modules/nfts';

async function main() {
    await client.start();
    const nfts = client.runtime.resolve("NFT");

    const minters = [
        "EKEfeB7Vey7ahPM15MJHjbHgZCEyYVoVQm3WwkbJ5ev4Nq9N9EZb", //B62qmGwhEanxXY7L4xEo2hi2A6fVAphgdnf8LVViQaz7kHe9vEpoZiU
        "EKFSESTUXHGCsLWWN3YLMNcRTkHD9GdLiRb1ZQxdjAFwvCyHHEed", //B62qmTVG7QwqPQEhTGWoLsSjdyYNjYJLmmoUciJGAbAgztKcAVryYcD
        // "EKF6WK1DxeAmqEha6ien8P4Mw4eq86AhwuoTnr6HMnhNZ17F7cgY",
        // "EKE7fwHHvtb6iDwcf5GtUiSqvGdzNuHjk84gpbtDdvNkZHChn2xf",
    ];
    const minterNonces = [0,0];
    const collection = [
        {
            index: [1, 2],
            baseUrl: `https://ipfs.io/ipfs/bafybeibc5sgo2plmjkq2tzmhrn54bk3crhnc23zd2msg4ea7a4pxrkgfna/{id}`,
            minter: 0,
        },
        {
            index: [1, 2],
            baseUrl: `https://ipfs.io/ipfs/QmPNnrntpxCvhjgANPU2RVqTHWbGCAzuy4AozmUXCop41X/{id}`,
            minter: 1,
        },
    ]

    for (const col of collection) {
        for (let id = col.index[0]; id <= col.index[1]; id++) {
            const url = col.baseUrl.replace("{id}", id.toString())
            const metaData = FixedString.fromString(url);
            const minterPvKey = PrivateKey.fromBase58(minters[col.minter]);
            
            let tx = await client.transaction(
                minterPvKey.toPublicKey(),
                async () => {
                  nfts.mint(
                    // randomly choose an receiver address
                    PrivateKey.fromBase58(
                      minters[Math.floor(Math.random() * minters.length)]
                    ).toPublicKey(),
                    metaData
                  );
                },
                { nonce: minterNonces[col.minter]++ }
              );
              // console.log("txn hash: ", tx.transaction?.hash().toString());
              tx.transaction = tx.transaction?.sign(minterPvKey);
              // await tx.sign();
              await tx.send();
              // wait??
              await new Promise((r) => setTimeout(r, 100));
              console.log("minted NFT: ", col.baseUrl, id);
        }
    }
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});