const { Wallet } = require('ethers');

(async () => {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error('Set PRIVATE_KEY');
  const w = new Wallet(pk.startsWith('0x') ? pk : '0x' + pk);
  console.log('Address:', w.address);
})();
