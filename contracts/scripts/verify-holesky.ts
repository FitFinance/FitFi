import { run } from 'hardhat';

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) throw new Error('Set CONTRACT_ADDRESS env var');

  await run('verify:verify', {
    address,
    constructorArguments: [],
    contract: 'contracts/FitFiSignup.sol:FitFiSignup',
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
