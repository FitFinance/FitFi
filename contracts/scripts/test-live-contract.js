const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Testing Live FitFi Contract on Core Testnet");
  console.log("=".repeat(60));

  // Load deployment info
  const deploymentFile = path.join(__dirname, '..', 'deployments', 'core_testnet-deployment.json');
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  const contractAddress = deploymentInfo.contractAddress;
  const platformAddress = deploymentInfo.platformAddress;
  
  console.log("📋 Contract Details:");
  console.log("   Contract Address:", contractAddress);
  console.log("   Platform Address:", platformAddress);
  console.log("   Network: Core Testnet");
  console.log("");

  // Connect to Core Testnet
  const provider = new ethers.JsonRpcProvider("https://rpc.test.btcs.network");
  
  // Load the contract
  const DuelStaking = await ethers.getContractFactory("DuelStaking");
  const contract = DuelStaking.attach(contractAddress);

  // Setup wallets
  const ownerPrivateKey = process.env.PRIVATE_KEY;
  const owner = new ethers.Wallet(ownerPrivateKey, provider);
  
  // Create test user wallets (generate new ones for this test)
  const user1 = ethers.Wallet.createRandom().connect(provider);
  const user2 = ethers.Wallet.createRandom().connect(provider);

  console.log("👥 Test Participants:");
  console.log("   Owner (Platform):", owner.address);
  console.log("   User1 (Tester):", user1.address);
  console.log("   User2 (Tester):", user2.address);
  console.log("");

  // Check owner balance
  const ownerBalance = await provider.getBalance(owner.address);
  console.log("💰 Owner Balance:", ethers.formatEther(ownerBalance), "CORE");
  
  if (ownerBalance < ethers.parseEther("0.2")) {
    console.log("❌ Owner needs more CORE tokens for gas fees and user funding!");
    console.log("   Visit: https://scan.test.btcs.network/faucet");
    console.log("   Current balance:", ethers.formatEther(ownerBalance), "CORE");
    console.log("   Minimum needed: 0.2 CORE");
    return;
  }

  // Verify contract is accessible
  console.log("🔍 Verifying contract accessibility...");
  try {
    const contractOwner = await contract.owner();
    const contractPlatform = await contract.platformAddress();
    console.log("   ✅ Contract Owner:", contractOwner);
    console.log("   ✅ Contract Platform:", contractPlatform);
    
    if (contractOwner.toLowerCase() !== owner.address.toLowerCase()) {
      console.log("❌ You are not the contract owner!");
      console.log("   Expected:", owner.address);
      console.log("   Actual:", contractOwner);
      return;
    }
  } catch (error) {
    console.log("❌ Cannot access contract:", error.message);
    return;
  }

  // Fund test users with some CORE for staking
  console.log("");
  console.log("💸 Funding test users...");
  const fundAmount = ethers.parseEther("0.3"); // 0.3 CORE each for staking + gas
  
  try {
    console.log("   Sending to User1...");
    const tx1 = await owner.sendTransaction({
      to: user1.address,
      value: fundAmount,
      gasLimit: 21000
    });
    await tx1.wait();
    console.log("   ✅ User1 funded with 0.3 CORE");

    console.log("   Sending to User2...");
    const tx2 = await owner.sendTransaction({
      to: user2.address, 
      value: fundAmount,
      gasLimit: 21000
    });
    await tx2.wait();
    console.log("   ✅ User2 funded with 0.3 CORE");
  } catch (error) {
    console.log("❌ Error funding users:", error.message);
    return;
  }

  // Verify user balances
  const user1Balance = await provider.getBalance(user1.address);
  const user2Balance = await provider.getBalance(user2.address);
  console.log("   User1 balance:", ethers.formatEther(user1Balance), "CORE");
  console.log("   User2 balance:", ethers.formatEther(user2Balance), "CORE");

  // Test staking
  const duelId = Math.floor(Math.random() * 1000000); // Random duel ID
  const stakeAmount = ethers.parseEther("0.1"); // 0.1 CORE each (smaller for testing)

  console.log("");
  console.log("⚔️ Starting Duel Test:");
  console.log("   Duel ID:", duelId);
  console.log("   Stake Amount:", ethers.formatEther(stakeAmount), "CORE each");
  console.log("");

  // Record initial balances (after funding)
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for transactions to settle
  
  const initialBalances = {
    user1: await provider.getBalance(user1.address),
    user2: await provider.getBalance(user2.address),
    platform: await provider.getBalance(platformAddress),
    contract: await provider.getBalance(contractAddress)
  };

  console.log("📊 Initial Balances (after funding):");
  console.log("   User1:", ethers.formatEther(initialBalances.user1), "CORE");
  console.log("   User2:", ethers.formatEther(initialBalances.user2), "CORE");
  console.log("   Platform:", ethers.formatEther(initialBalances.platform), "CORE");
  console.log("   Contract:", ethers.formatEther(initialBalances.contract), "CORE");
  console.log("");

  // User1 stakes
  console.log("🎯 User1 staking...");
  try {
    const stakeTx1 = await contract.connect(user1).stakeForDuel(duelId, {
      value: stakeAmount,
      gasLimit: 150000
    });
    console.log("   📋 Transaction submitted:", stakeTx1.hash);
    const receipt1 = await stakeTx1.wait();
    console.log("   ✅ User1 stake confirmed in block:", receipt1.blockNumber);
    console.log("   🔗 View: https://scan.test.btcs.network/tx/" + stakeTx1.hash);
  } catch (error) {
    console.log("   ❌ User1 stake failed:", error.message);
    if (error.data) {
      console.log("   Error data:", error.data);
    }
    return;
  }

  // User2 stakes  
  console.log("");
  console.log("🎯 User2 staking...");
  try {
    const stakeTx2 = await contract.connect(user2).stakeForDuel(duelId, {
      value: stakeAmount,
      gasLimit: 150000
    });
    console.log("   📋 Transaction submitted:", stakeTx2.hash);
    const receipt2 = await stakeTx2.wait();
    console.log("   ✅ User2 stake confirmed in block:", receipt2.blockNumber);
    console.log("   🔗 View: https://scan.test.btcs.network/tx/" + stakeTx2.hash);
  } catch (error) {
    console.log("   ❌ User2 stake failed:", error.message);
    if (error.data) {
      console.log("   Error data:", error.data);
    }
    return;
  }

  // Wait for transactions to settle
  console.log("⏳ Waiting for blockchain to settle...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check contract balance after staking
  const contractBalanceAfterStaking = await provider.getBalance(contractAddress);
  console.log("");
  console.log("💰 Contract balance after staking:", ethers.formatEther(contractBalanceAfterStaking), "CORE");
  console.log("   Expected: ~0.2 CORE (both stakes)");

  // Verify stakes are recorded
  console.log("");
  console.log("🔍 Verifying stakes are recorded...");
  try {
    const user1Stake = await contract.getStake(duelId, user1.address);
    const user2Stake = await contract.getStake(duelId, user2.address);
    const totalStakes = await contract.getTotalDuelStakes(duelId, user1.address, user2.address);
    
    console.log("📋 Verified Stakes:");
    console.log("   User1 stake:", ethers.formatEther(user1Stake), "CORE");
    console.log("   User2 stake:", ethers.formatEther(user2Stake), "CORE");
    console.log("   Total stakes:", ethers.formatEther(totalStakes), "CORE");
    
    if (user1Stake < stakeAmount || user2Stake < stakeAmount) {
      console.log("❌ Stakes not recorded correctly!");
      return;
    }
  } catch (error) {
    console.log("❌ Error verifying stakes:", error.message);
    return;
  }

  // Simulate duel completion and settlement
  console.log("");
  console.log("🏆 Settling Duel (User1 wins)...");
  
  try {
    const settleTx = await contract.connect(owner).settleDuel(duelId, user1.address, user2.address, {
      gasLimit: 250000
    });
    console.log("   📋 Settlement transaction submitted:", settleTx.hash);
    const receipt = await settleTx.wait();
    console.log("   ✅ Duel settled in block:", receipt.blockNumber);
    console.log("   🔗 View: https://scan.test.btcs.network/tx/" + settleTx.hash);
    
    // Parse events
    if (receipt.logs && receipt.logs.length > 0) {
      console.log("   📋 Events emitted:", receipt.logs.length);
    }
  } catch (error) {
    console.log("   ❌ Settlement failed:", error.message);
    if (error.data) {
      console.log("   Error data:", error.data);
    }
    return;
  }

  // Wait for settlement to process
  console.log("⏳ Waiting for settlement to process...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check final balances
  const finalBalances = {
    user1: await provider.getBalance(user1.address),
    user2: await provider.getBalance(user2.address), 
    platform: await provider.getBalance(platformAddress),
    contract: await provider.getBalance(contractAddress)
  };

  console.log("");
  console.log("📊 Final Balances:");
  console.log("   User1:", ethers.formatEther(finalBalances.user1), "CORE");
  console.log("   User2:", ethers.formatEther(finalBalances.user2), "CORE");
  console.log("   Platform:", ethers.formatEther(finalBalances.platform), "CORE");
  console.log("   Contract:", ethers.formatEther(finalBalances.contract), "CORE");

  // Calculate net changes (excluding initial funding, focusing on stake outcomes)
  const stakingChanges = {
    user1: finalBalances.user1 - (initialBalances.user1 - stakeAmount), // What they got back vs what they staked
    user2: finalBalances.user2 - (initialBalances.user2 - stakeAmount),
    platform: finalBalances.platform - initialBalances.platform,
    contract: finalBalances.contract - initialBalances.contract
  };

  console.log("");
  console.log("📈 Net Changes from Staking:");
  console.log("   User1 (Winner) net gain:", ethers.formatEther(stakingChanges.user1), "CORE");
  console.log("   User2 (Loser) net gain:", ethers.formatEther(stakingChanges.user2), "CORE");
  console.log("   Platform net gain:", ethers.formatEther(stakingChanges.platform), "CORE");
  console.log("   Contract change:", ethers.formatEther(stakingChanges.contract), "CORE");

  // Verify 85/10/5 distribution
  const totalStaked = stakeAmount * 2n; // 0.2 CORE total
  const expectedWinnerReward = (totalStaked * 85n) / 100n; // 0.17 CORE (85% of 0.2)
  const expectedPlatformReward = (totalStaked * 10n) / 100n; // 0.02 CORE (10% of 0.2)  
  const expectedLoserReward = (totalStaked * 5n) / 100n; // 0.01 CORE (5% of 0.2)

  console.log("");
  console.log("✅ Expected Reward Distribution (85/10/5):");
  console.log("   Winner should get:", ethers.formatEther(expectedWinnerReward), "CORE (85%)");
  console.log("   Platform should get:", ethers.formatEther(expectedPlatformReward), "CORE (10%)");
  console.log("   Loser should get:", ethers.formatEther(expectedLoserReward), "CORE (5%)");

  // Verify results (with gas tolerance)
  const gasBuffer = ethers.parseEther("0.02"); // 0.02 CORE buffer for gas costs
  
  const winnerGainCorrect = Math.abs(Number(stakingChanges.user1 - expectedWinnerReward)) < Number(gasBuffer);
  const platformGainCorrect = Math.abs(Number(stakingChanges.platform - expectedPlatformReward)) < Number(gasBuffer);
  const loserGainCorrect = Math.abs(Number(stakingChanges.user2 - expectedLoserReward)) < Number(gasBuffer);
  const contractEmptyCorrect = Math.abs(Number(stakingChanges.contract)) < Number(gasBuffer);

  console.log("");
  console.log("🎯 Distribution Verification:");
  console.log("   Winner reward (85%):", winnerGainCorrect ? "✅ CORRECT" : "❌ INCORRECT");
  console.log("   Platform fee (10%):", platformGainCorrect ? "✅ CORRECT" : "❌ INCORRECT"); 
  console.log("   Loser reward (5%):", loserGainCorrect ? "✅ CORRECT" : "❌ INCORRECT");
  console.log("   Contract emptied:", contractEmptyCorrect ? "✅ CORRECT" : "❌ INCORRECT");

  // Verify stakes are cleared
  console.log("");
  console.log("🔍 Verifying stakes are cleared...");
  try {
    const user1StakeAfter = await contract.getStake(duelId, user1.address);
    const user2StakeAfter = await contract.getStake(duelId, user2.address);
    
    const stakesCleared = user1StakeAfter === 0n && user2StakeAfter === 0n;
    console.log("   Stakes cleared:", stakesCleared ? "✅ YES" : "❌ NO");
    console.log("   User1 remaining stake:", ethers.formatEther(user1StakeAfter), "CORE");
    console.log("   User2 remaining stake:", ethers.formatEther(user2StakeAfter), "CORE");
  } catch (error) {
    console.log("❌ Error checking stake clearing:", error.message);
  }

  // Final results
  console.log("");
  console.log("=".repeat(60));
  
  if (winnerGainCorrect && platformGainCorrect && loserGainCorrect && contractEmptyCorrect) {
    console.log("🎉 LIVE TEST SUCCESS! FitFi contract works perfectly!");
    console.log("");
    console.log("✅ VERIFIED FUNCTIONALITY:");
    console.log("   🎯 Users can stake CORE tokens");
    console.log("   ⚔️ Multiple users can join same duel");
    console.log("   🏆 Owner can settle duels and declare winners");
    console.log("   💰 85/10/5 reward distribution works correctly");
    console.log("   🏦 Platform automatically earns 10% fees");
    console.log("   🧹 Contract state is properly cleaned after settlement");
    console.log("");
    console.log("🚀 YOUR BLOCKCHAIN INFRASTRUCTURE IS PRODUCTION READY!");
    console.log("💰 Platform Revenue Model: ACTIVE & WORKING");
    console.log("🎮 Ready for Frontend/Backend Integration");
  } else {
    console.log("❌ SOME VERIFICATIONS FAILED");
    console.log("Check the distribution calculations above for details");
  }
  
  console.log("");
  console.log("🔗 View all transactions on Core Testnet Explorer:");
  console.log("   Contract: https://scan.test.btcs.network/address/" + contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Live test failed:", error);
    process.exit(1);
  });
