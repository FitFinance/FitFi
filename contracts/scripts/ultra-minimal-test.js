const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Ultra-Minimal Platform Fee Test (0.01 tCORE)");
  console.log("=" .repeat(50));

  // Load deployment info
  const deploymentFile = path.join(__dirname, '..', 'deployments', 'core_testnet-deployment.json');
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  const contractAddress = deploymentInfo.contractAddress;
  const platformAddress = deploymentInfo.platformAddress;
  
  console.log("📋 Test Configuration:");
  console.log("   Contract:", contractAddress);
  console.log("   Platform Wallet:", platformAddress);
  console.log("");

  // Connect to Core Testnet
  const provider = new ethers.JsonRpcProvider("https://rpc.test.btcs.network");
  
  // Setup owner wallet
  const ownerPrivateKey = process.env.PRIVATE_KEY;
  const owner = new ethers.Wallet(ownerPrivateKey, provider);
  
  // Load contract
  const DuelStaking = await ethers.getContractFactory("DuelStaking");
  const contract = DuelStaking.attach(contractAddress);

  // Check initial balances
  console.log("💰 Initial Balances:");
  const ownerBalance = await provider.getBalance(owner.address);
  const platformBalance = await provider.getBalance(platformAddress);
  
  console.log("   Owner:", ethers.formatEther(ownerBalance), "tCORE");
  console.log("   Platform:", ethers.formatEther(platformBalance), "tCORE");

  if (ownerBalance < ethers.parseEther("0.02")) {
    console.log("❌ Need at least 0.02 tCORE for this test");
    console.log("   Current balance:", ethers.formatEther(ownerBalance), "tCORE");
    return;
  }

  // Create two test users
  const user1 = ethers.Wallet.createRandom().connect(provider);
  const user2 = ethers.Wallet.createRandom().connect(provider);
  
  console.log("");
  console.log("👥 Test Users:");
  console.log("   User1:", user1.address.slice(0, 10) + "...");
  console.log("   User2:", user2.address.slice(0, 10) + "...");

  // Ultra-minimal amounts
  const fundAmount = ethers.parseEther("0.008"); // 0.008 tCORE each user (for stake + gas)
  const stakeAmount = ethers.parseEther("0.005"); // 0.005 tCORE stake each
  
  console.log("");
  console.log("💸 Funding users with", ethers.formatEther(fundAmount), "tCORE each...");
  console.log("📊 Stake amount:", ethers.formatEther(stakeAmount), "tCORE each");
  console.log("📊 Total stakes:", ethers.formatEther(stakeAmount * 2n), "tCORE");
  
  try {
    // Fund user1
    const fundTx1 = await owner.sendTransaction({
      to: user1.address,
      value: fundAmount,
      gasLimit: 21000,
      gasPrice: ethers.parseUnits("1", "gwei") // Low gas price
    });
    await fundTx1.wait();
    console.log("   ✅ User1 funded");

    // Fund user2  
    const fundTx2 = await owner.sendTransaction({
      to: user2.address,
      value: fundAmount,
      gasLimit: 21000,
      gasPrice: ethers.parseUnits("1", "gwei")
    });
    await fundTx2.wait();
    console.log("   ✅ User2 funded");
  } catch (error) {
    console.log("❌ Funding failed:", error.message);
    return;
  }

  // Start duel test
  const duelId = Math.floor(Math.random() * 1000000);
  console.log("");
  console.log("⚔️ Testing Duel #" + duelId);

  // Record platform balance before staking
  const platformBalanceBefore = await provider.getBalance(platformAddress);

  // User1 stakes
  console.log("");
  console.log("🎯 User1 staking", ethers.formatEther(stakeAmount), "tCORE...");
  try {
    const stakeTx1 = await contract.connect(user1).stakeForDuel(duelId, {
      value: stakeAmount,
      gasLimit: 60000,
      gasPrice: ethers.parseUnits("1", "gwei")
    });
    await stakeTx1.wait();
    console.log("   ✅ User1 staked successfully");
    console.log("   🔗 TX:", "https://scan.test.btcs.network/tx/" + stakeTx1.hash);
  } catch (error) {
    console.log("   ❌ User1 stake failed:", error.message);
    return;
  }

  // User2 stakes
  console.log("🎯 User2 staking", ethers.formatEther(stakeAmount), "tCORE...");
  try {
    const stakeTx2 = await contract.connect(user2).stakeForDuel(duelId, {
      value: stakeAmount,
      gasLimit: 60000,
      gasPrice: ethers.parseUnits("1", "gwei")
    });
    await stakeTx2.wait();
    console.log("   ✅ User2 staked successfully");
    console.log("   🔗 TX:", "https://scan.test.btcs.network/tx/" + stakeTx2.hash);
  } catch (error) {
    console.log("   ❌ User2 stake failed:", error.message);
    return;
  }

  // Verify stakes are recorded
  const user1Stake = await contract.getStake(duelId, user1.address);
  const user2Stake = await contract.getStake(duelId, user2.address);
  console.log("");
  console.log("📋 Verified Stakes:");
  console.log("   User1:", ethers.formatEther(user1Stake), "tCORE");
  console.log("   User2:", ethers.formatEther(user2Stake), "tCORE");

  // Settle duel (User1 wins)
  console.log("");
  console.log("🏆 Settling duel (User1 wins)...");
  try {
    const settleTx = await contract.connect(owner).settleDuel(duelId, user1.address, user2.address, {
      gasLimit: 120000,
      gasPrice: ethers.parseUnits("1", "gwei")
    });
    await settleTx.wait();
    console.log("   ✅ Duel settled successfully");
    console.log("   🔗 TX:", "https://scan.test.btcs.network/tx/" + settleTx.hash);
  } catch (error) {
    console.log("   ❌ Settlement failed:", error.message);
    return;
  }

  // Check platform balance after settlement
  const platformBalanceAfter = await provider.getBalance(platformAddress);
  const platformGain = platformBalanceAfter - platformBalanceBefore;
  
  console.log("");
  console.log("📊 Platform Fee Results:");
  console.log("   Platform before:", ethers.formatEther(platformBalanceBefore), "tCORE");
  console.log("   Platform after:", ethers.formatEther(platformBalanceAfter), "tCORE");
  console.log("   Platform gained:", ethers.formatEther(platformGain), "tCORE");

  // Calculate expected platform fee (10% of total stakes)
  const totalStakes = stakeAmount * 2n; // 0.01 tCORE total
  const expectedPlatformFee = (totalStakes * 10n) / 100n; // 0.001 tCORE expected
  
  console.log("");
  console.log("🎯 Revenue Verification:");
  console.log("   Total staked:", ethers.formatEther(totalStakes), "tCORE");
  console.log("   Expected platform fee (10%):", ethers.formatEther(expectedPlatformFee), "tCORE");
  console.log("   Actual platform gain:", ethers.formatEther(platformGain), "tCORE");
  
  // Verify platform fee is correct
  const feeCorrect = platformGain === expectedPlatformFee;
  
  if (feeCorrect) {
    console.log("   ✅ PLATFORM FEE CORRECT! 🎉");
    console.log("");
    console.log("🎉 SUCCESS! Revenue Model Working!");
    console.log("   💰 You earned:", ethers.formatEther(platformGain), "tCORE");
    console.log("   📈 That's 10% of all stakes automatically!");
    console.log("   🏦 Check your MetaMask for platform wallet balance!");
  } else {
    console.log("   ❌ Platform fee mismatch");
    console.log("   Difference:", ethers.formatEther(platformGain - expectedPlatformFee), "tCORE");
  }

  // Check if stakes are cleared
  const user1StakeAfter = await contract.getStake(duelId, user1.address);
  const user2StakeAfter = await contract.getStake(duelId, user2.address);
  console.log("");
  console.log("🔍 Post-Settlement Verification:");
  console.log("   User1 stake cleared:", user1StakeAfter === 0n ? "✅" : "❌");
  console.log("   User2 stake cleared:", user2StakeAfter === 0n ? "✅" : "❌");

  // Check remaining owner balance for more tests
  const finalOwnerBalance = await provider.getBalance(owner.address);
  const testCost = ethers.parseEther("0.008");
  const remainingTests = Math.floor(Number(finalOwnerBalance) / Number(testCost));
  
  console.log("");
  console.log("💰 Test Economics:");
  console.log("   Owner balance remaining:", ethers.formatEther(finalOwnerBalance), "tCORE");
  console.log("   Estimated tests remaining:", remainingTests);
  console.log("   Test cost: ~0.008 tCORE per test");
  
  console.log("");
  console.log("🔄 Ready for more tests! Run this script again to verify consistency.");
  console.log("📱 Check your MetaMask platform wallet:", platformAddress);
  console.log("🌐 View on explorer: https://scan.test.btcs.network/address/" + platformAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
