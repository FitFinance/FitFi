import { ethers } from 'hardhat';

async function main() {
  let signer = (await ethers.getSigners())[0];

  if (!signer) {
    const pkRaw = process.env.HOLESKY_PRIVATE_KEY || process.env.PRIVATE_KEY;
    const rpc =
      process.env.HOLESKY_RPC_URL || 'https://ethereum-holesky.publicnode.com';
    if (!pkRaw) {
      throw new Error(
        'No signer available. Set HOLESKY_PRIVATE_KEY (preferred) or PRIVATE_KEY in .env (with 0x prefix).'
      );
    }
    const pk = pkRaw.startsWith('0x') ? pkRaw : '0x' + pkRaw;
    const provider = new (await import('ethers')).JsonRpcProvider(rpc);
    signer = new (await import('ethers')).Wallet(pk, provider) as any;
  }

  const addr = await signer.getAddress();
  const bal = await signer.provider!.getBalance(addr);
  console.log('Deployer:', addr);
  console.log('Balance:', bal.toString());

  const FitFiSignup = await ethers.getContractFactory('FitFiSignup', signer);
  const contract = await FitFiSignup.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('FitFiSignup deployed to:', address);

  // Optional: Etherscan verification delay
  if (process.env.ETHERSCAN_API_KEY) {
    console.log('Waiting 30s before verify...');
    await new Promise((r) => setTimeout(r, 30000));
    try {
      await (
        await import('@nomicfoundation/hardhat-toolbox/internal/verify')
      ).verify({
        address,
        constructorArguments: [],
        contract: 'contracts/FitFiSignup.sol:FitFiSignup',
      });
      console.log('Verified on Etherscan (Holesky)');
    } catch (e) {
      console.warn('Verification failed:', (e as any)?.message || e);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
