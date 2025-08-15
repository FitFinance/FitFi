import { ethers } from 'hardhat';

async function main() {
  let signer = (await ethers.getSigners())[0];

  if (!signer) {
    const pkRaw = process.env.HOLESKY_PRIVATE_KEY || process.env.PRIVATE_KEY;
    const rpc =
      process.env.HOLESKY_RPC_URL || 'https://ethereum-holesky.publicnode.com';
    if (!pkRaw) {
      throw new Error(
        'No signer available. Set HOLESKY_PRIVATE_KEY or PRIVATE_KEY in .env'
      );
    }
    const pk = pkRaw.startsWith('0x') ? pkRaw : '0x' + pkRaw;
    const provider = new (await import('ethers')).JsonRpcProvider(rpc);
    signer = new (await import('ethers')).Wallet(pk, provider) as any;
  }

  const addr = await signer.getAddress();
  const bal = await signer.provider!.getBalance(addr);
  const balEth = ethers.formatEther(bal);

  console.log('Address:', addr);
  console.log('Balance:', balEth, 'ETH');
  console.log('Balance (wei):', bal.toString());

  const minRequired = ethers.parseEther('0.001'); // ~1000 gas units * 20 gwei
  if (bal >= minRequired) {
    console.log('✅ Sufficient balance for deployment');
  } else {
    console.log('❌ Insufficient balance. Need at least 0.001 ETH');
    console.log('Get testnet ETH from: https://holesky-faucet.pk910.de/');
  }
}

main().catch(console.error);
