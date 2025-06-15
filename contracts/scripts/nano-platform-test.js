const { ethers } = require("hardhat");

async function main() {
  console.log("🔬 Nano Platform Fee Test");
  console.log("=".repeat(30));

  // Contract info from deployment
  const contractAddress = "0xD6D0F20D055748302877a2a635a22F5dD0d0433D";
  const platformAddress = "0xFeA68598eEAd1Ae974A0Da5bcFAc197e9c165fE1";
  
  // Connect
  const provider = new ethers.JsonRpcProvider("https://rpc.test.btcs.network");
  const owner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Check owner balance
  const ownerBalance = await provider.getBalance(owner.address);
  console.log("👤 Owner:", owner.address);
  console.log("💰 Balance:", ethers.formatEther(ownerBalance), "CORE");
  
  if (ownerBalance < ethers.parseEther("0.015")) {
    console.log("❌ Need at least 0.015 CORE");
    return;
  }

  // Load contract
  const DuelStaking = await ethers.getContractFactory("DuelStaking");
  const contract = DuelStaking.attach(contractAddress);

  // Create users with tiny amounts
  const user1 = ethers.Wallet.createRandom().connect(provider);
  const user2 = ethers.Wallet.createRandom().connect(provider);
  
  const stakeAmount = ethers.parseEther("0.002"); // 0.002 CORE each
  const fundAmount = ethers.parseEther("0.004"); // 0.004 CORE funding
  
  console.log("🎯 Stake amount:", ethers.formatEther(stakeAmount), "CORE each");
  console.log("📊 Expected platform fee:", ethers.formatEther(stakeAmount * 2n * 10n / 100n), "CORE");
  
  // Check platform balance before
  const platformBefore = await provider.getBalance(platformAddress);
  console.log("💰 Platform before:", ethers.formatEther(platformBefore), "CORE");

  // Fund users
  await owner.sendTransaction({ to: user1.address, value: fundAmount });
  await owner.sendTransaction({ to: user2.address, value: fundAmount });
  console.log("✅ Users funded");

  const duelId = Date.now();

  // Stake
  await contract.connect(user1).stakeForDuel(duelId, { value: stakeAmount });
  await contract.connect(user2).stakeForDuel(duelId, { value: stakeAmount });
  console.log("✅ Stakes placed");

  // Settle (user1 wins)
  await contract.connect(owner).settleDuel(duelId, user1.address, user2.address);
  console.log("✅ Duel settled");

  // Check platform balance after
  await new Promise(resolve => setTimeout(resolve, 2000));
  const platformAfter = await provider.getBalance(platformAddress);
  console.log("💰 Platform after:", ethers.formatEther(platformAfter), "CORE");
  
  const platformFee = platformAfter - platformBefore;
  const expectedFee = stakeAmount * 2n * 10n / 100n;
  
  console.log("");
  console.log("📊 RESULTS:");
  console.log("   Expected fee:", ethers.formatEther(expectedFee), "CORE");
  console.log("   Actual fee:", ethers.formatEther(platformFee), "CORE");
  console.log("   Status:", platformFee === expectedFee ? "✅ SUCCESS" : "❌ FAILED");
  
  if (platformFee === expectedFee) {
    console.log("");
    console.log("🎉 PLATFORM FEES WORKING!");
    console.log("✅ Your revenue model is live and functional");
    console.log("💰 Platform wallet receives 10% of each duel");
  }
}

main().catch(console.error);
