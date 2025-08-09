import { JsonRpcProvider, Contract } from 'ethers';

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address)
    throw new Error('Set CONTRACT_ADDRESS env var to the FitFiSignup address');
  const rpc =
    process.env.HOLESKY_RPC_URL || 'https://ethereum-holesky.publicnode.com';
  const provider = new JsonRpcProvider(rpc);
  const abi = ['function owner() view returns (address)'];
  const c = new Contract(address, abi, provider);
  const owner: string = await c.owner();
  console.log('FitFiSignup owner:', owner);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
