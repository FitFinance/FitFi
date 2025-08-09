import { JsonRpcProvider, Wallet, Contract } from 'ethers';

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  const newOwner = process.env.NEW_OWNER;
  const pkRaw = process.env.HOLESKY_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const rpc =
    process.env.HOLESKY_RPC_URL || 'https://ethereum-holesky.publicnode.com';

  if (!address)
    throw new Error('Set CONTRACT_ADDRESS to the FitFiSignup address');
  if (!newOwner)
    throw new Error('Set NEW_OWNER to the desired owner EOA address');
  if (!pkRaw)
    throw new Error(
      "Set HOLESKY_PRIVATE_KEY (preferred) or PRIVATE_KEY in env (owner's private key)"
    );

  const pk = pkRaw.startsWith('0x') ? pkRaw : '0x' + pkRaw;
  const provider = new JsonRpcProvider(rpc);
  const wallet = new Wallet(pk, provider);

  const abi = [
    'function owner() view returns (address)',
    'function transferOwnership(address newOwner) external',
  ];
  const c = new Contract(address, abi, wallet);

  const current = await c.owner();
  console.log('Current owner:', current);
  if (current.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(
      `The provided key is not the current owner (${current}). Ensure HOLESKY_PRIVATE_KEY/PRIVATE_KEY matches the contract owner.`
    );
  }

  console.log('Transferring ownership to:', newOwner);
  const tx = await c.transferOwnership(newOwner);
  console.log('Submitted:', tx.hash);
  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt?.blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
