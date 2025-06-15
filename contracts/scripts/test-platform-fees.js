const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("💰 FitFi Platform Fee Verification Test");
  console.log("=" .repeat(50));

  // Load deployment info
  const deploymentFile = path.join(__dirname, '..', 'deployments', 'core_testnet-deployment.json');
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  const contractAddress = deploymentInfo.contractAddress;
  const platformAddress = deploymentInfo.platformAddress;
  
  console.log("📋 Test Configuration:");
  console.log("   Contract:", contractAddress);
  console.log("   Platform Fee Wallet:", platformAddress);
  console.log("");

  // Connect to Core Testnet
  const provider = new ethers.JsonRpcProvider("https://rpc.test.btcs.network");
  const ownerPrivateKey = process.env.PRIVATE_KEY;
  const owner = new ethers.Wallet(ownerPrivateKey, provider);
  
  // Load contract
  const DuelStaking = await ethers.getContractFactory("DuelStaking");
  const contract = DuelStaking.attach(contractAddress);

  console.log("👤 Owner/Deployer:", owner.address);
  
  // Check balances
  const ownerBalance = await provider.getBalance(owner.address);
  const platformBalance = await provider.getBalance(platformAddress);
  
  console.log("💰 Current Balances:");
  console.log("   Owner balance:", ethers.formatEther(ownerBalance), "CORE");
  console.log("   Platform balance:", ethers.formatEther(platformBalance), "CORE");
  console.log("");

  if (ownerBalance < ethers.parseEther("0.5")) {
    console.log("❌ Need more CORE tokens for testing!");
    console.log("   Current:", ethers.formatEther(ownerBalance), "CORE");
    console.log("   Need at least: 0.5 CORE");
    console.log("   Get tokens: https://scan.test.btcs.network/faucet");
    console.log("   Address:", owner.address);
    return;
  }

  // Create test users
  const user1 = ethers.Wallet.createRandom().connect(provider);
  const user2 = ethers.Wallet.createRandom().connect(provider);
  
  console.log("👥 Test Users:");
  console.log("   User1:", user1.address);
  console.log("   User2:", user2.address);
  console.log("");

  // Fund users with smaller amounts for testing
  const fundAmount = ethers.parseEther("0.15"); // 0.15 CORE each
  const stakeAmount = ethers.parseEther("0.1");  // 0.1 CORE stake each
  
  console.log("💸 Funding test users...");
  try {
    const tx1 = await owner.sendTransaction({
      to: user1.address,
      value: fundAmount,
      gasLimit: 21000
    });
    await tx1.wait();
    console.log("   ✅ User1 funded with", ethers.formatEther(fundAmount), "CORE");

    const tx2 = await owner.sendTransaction({
      to: user2.address,
      value: fundAmount,
      gasLimit: 21000
    });
    await tx2.wait();
    console.log("   ✅ User2 funded with", ethers.formatEther(fundAmount), "CORE");
  } catch (error) {
    console.log("❌ Funding failed:", error.message);
    return;
  }

  console.log("");
  console.log("⚔️ Starting Platform Fee Test:");
  console.log("   Total stake pool: 0.2 CORE (0.1 each)");
  console.log("   Expected platform fee: 0.02 CORE (10%)");
  console.log("");

  const duelId = Date.now(); // Use timestamp as duel ID

  // Record platform balance before staking
  const platformBalanceBefore = await provider.getBalance(platformAddress);
  console.log("📊 Platform balance BEFORE staking:", ethers.formatEther(platformBalanceBefore), "CORE");

  // Users stake
  console.log("🎯 User staking phase...");
  try {
    const stakeTx1 = await contract.connect(user1).stakeForDuel(duelId, {
      value: stakeAmount,
      gasLimit: 150000
    });
    await stakeTx1.wait();
    console.log("   ✅ User1 staked", ethers.formatEther(stakeAmount), "CORE");

    const stakeTx2 = await contract.connect(user2).stakeForDuel(duelId, {
      value: stakeAmount,
      gasLimit: 150000
    });
    await stakeTx2.wait();
    console.log("   ✅ User2 staked", ethers.formatEther(stakeAmount), "CORE");
  } catch (error) {
    console.log("❌ Staking failed:", error.message);
    return;
  }

  // Verify stakes are recorded
  const user1Stake = await contract.getStake(duelId, user1.address);
  const user2Stake = await contract.getStake(duelId, user2.address);
  const totalStakes = user1Stake + user2Stake;
  
  console.log("📋 Stakes verified:");
  console.log("   User1 stake:", ethers.formatEther(user1Stake), "CORE");
  console.log("   User2 stake:", ethers.formatEther(user2Stake), "CORE");
  console.log("   Total pool:", ethers.formatEther(totalStakes), "CORE");
  console.log("");

  // Platform balance should still be the same (no fees until settlement)
  const platformBalanceAfterStaking = await provider.getBalance(platformAddress);
  console.log("📊 Platform balance AFTER staking:", ethers.formatEther(platformBalanceAfterStaking), "CORE");
  console.log("   (Should be same as before - fees come on settlement)");
  console.log("");

  // Settle duel (User1 wins)
  console.log("🏆 Settling duel (User1 wins)...");
  try {
    const settleTx = await contract.connect(owner).settleDuel(duelId, user1.address, user2.address, {
      gasLimit: 250000
    });
    const receipt = await settleTx.wait();
    console.log("   ✅ Duel settled in block:", receipt.blockNumber);
    console.log("   🔗 Transaction:", "https://scan.test.btcs.network/tx/" + settleTx.hash);
  } catch (error) {
    console.log("❌ Settlement failed:", error.message);
    return;
  }

  // Wait a moment for blockchain to update
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check platform balance after settlement
  const platformBalanceAfterSettlement = await provider.getBalance(platformAddress);
  console.log("");
  console.log("📊 Platform balance AFTER settlement:", ethers.formatEther(platformBalanceAfterSettlement), "CORE");
  
  // Calculate platform fee received
  const platformFeeReceived = platformBalanceAfterSettlement - platformBalanceBefore;
  const expectedPlatformFee = (totalStakes * 10n) / 100n; // 10% of total stakes
  
  console.log("");
  console.log("💰 Platform Fee Analysis:");
  console.log("   Expected fee (10%):", ethers.formatEther(expectedPlatformFee), "CORE");
  console.log("   Actual fee received:", ethers.formatEther(platformFeeReceived), "CORE");
  
  const feeCorrect = platformFeeReceived === expectedPlatformFee;
  console.log("   Fee calculation:", feeCorrect ? "✅ CORRECT" : "❌ INCORRECT");
  
  if (!feeCorrect) {
    console.log("   Difference:", ethers.formatEther(platformFeeReceived - expectedPlatformFee), "CORE");
  }

  // Final verification
  console.log("");
  console.log("🔍 Final Verification:");
  
  // Check that stakes are cleared
  const user1StakeAfter = await contract.getStake(duelId, user1.address);
  const user2StakeAfter = await contract.getStake(duelId, user2.address);
  
  console.log("   Stakes cleared:", (user1StakeAfter === 0n && user2StakeAfter === 0n) ? "✅ YES" : "❌ NO");
  console.log("   Platform fee received:", feeCorrect ? "✅ YES" : "❌ NO");
  
  if (feeCorrect) {
    console.log("");
    console.log("🎉 PLATFORM FEE TEST: SUCCESS!");
    console.log("✅ Your platform wallet is receiving 10% fees correctly!");
    console.log("");
    console.log("📋 Revenue Model Working:");
    console.log("   Contract:", contractAddress);
    console.log("   Platform wallet:", platformAddress);
    console.log("   Fee rate: 10% of each duel");
    console.log("   Revenue this test:", ethers.formatEther(platformFeeReceived), "CORE");
  } else {
    console.log("");
    console.log("❌ PLATFORM FEE TEST: FAILED");
    console.log("Platform fees are not being distributed correctly!");
    console.log("Need to investigate the smart contract settlement function.");
  }
  
  console.log("");
  console.log("🔗 Check your platform wallet:");
  console.log("   https://scan.test.btcs.network/address/" + platformAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
