const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔬 FitFi Micro Platform Fee Test");
  console.log("=" .repeat(40));

  // Load deployment info
  const deploymentFile = path.join(__dirname, '..', 'deployments', 'core_testnet-deployment.json');
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  const contractAddress = deploymentInfo.contractAddress;
  const platformAddress = deploymentInfo.platformAddress;
  
  console.log("📋 Configuration:");
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

  if (ownerBalance < ethers.parseEther("0.02")) {
    console.log("❌ Need at least 0.02 CORE for micro test!");
    console.log("   Current:", ethers.formatEther(ownerBalance), "CORE");
    return;
  }

  // Create test users - using deterministic wallets to save gas
  const user1 = new ethers.Wallet("0x1111111111111111111111111111111111111111111111111111111111111111", provider);
  const user2 = new ethers.Wallet("0x2222222222222222222222222222222222222222222222222222222222222222", provider);
  
  console.log("👥 Test Users:");
  console.log("   User1:", user1.address);
  console.log("   User2:", user2.address);
  console.log("");

  // Use very small amounts for this test
  const fundAmount = ethers.parseEther("0.008"); // 0.008 CORE each
  const stakeAmount = ethers.parseEther("0.005");  // 0.005 CORE stake each
  
  console.log("💸 Funding test users (micro amounts)...");
  try {
    const tx1 = await owner.sendTransaction({
      to: user1.address,
      value: fundAmount,
      gasLimit: 21000,
      gasPrice: ethers.parseUnits("1", "gwei") // 1 gwei gas price
    });
    await tx1.wait();
    console.log("   ✅ User1 funded with", ethers.formatEther(fundAmount), "CORE");

    const tx2 = await owner.sendTransaction({
      to: user2.address,
      value: fundAmount,
      gasLimit: 21000,
      gasPrice: ethers.parseUnits("1", "gwei")
    });
    await tx2.wait();
    console.log("   ✅ User2 funded with", ethers.formatEther(fundAmount), "CORE");
  } catch (error) {
    console.log("❌ Funding failed:", error.message);
    return;
  }

  console.log("");
  console.log("⚔️ Micro Platform Fee Test:");
  console.log("   Total stake pool: 0.01 CORE (0.005 each)");
  console.log("   Expected platform fee: 0.001 CORE (10%)");
  console.log("");

  const duelId = Date.now(); // Use timestamp as duel ID

  // Record platform balance before staking
  const platformBalanceBefore = await provider.getBalance(platformAddress);
  console.log("📊 Platform balance BEFORE:", ethers.formatEther(platformBalanceBefore), "CORE");

  // Users stake
  console.log("🎯 Staking phase...");
  try {
    const stakeTx1 = await contract.connect(user1).stakeForDuel(duelId, {
      value: stakeAmount,
      gasLimit: 150000,
      gasPrice: ethers.parseUnits("1", "gwei")
    });
    await stakeTx1.wait();
    console.log("   ✅ User1 staked", ethers.formatEther(stakeAmount), "CORE");

    const stakeTx2 = await contract.connect(user2).stakeForDuel(duelId, {
      value: stakeAmount,
      gasLimit: 150000,
      gasPrice: ethers.parseUnits("1", "gwei")
    });
    await stakeTx2.wait();
    console.log("   ✅ User2 staked", ethers.formatEther(stakeAmount), "CORE");
  } catch (error) {
    console.log("❌ Staking failed:", error.message);
    return;
  }

  // Verify stakes
  const user1Stake = await contract.getStake(duelId, user1.address);
  const user2Stake = await contract.getStake(duelId, user2.address);
  const totalStakes = user1Stake + user2Stake;
  
  console.log("📋 Stakes verified:");
  console.log("   User1 stake:", ethers.formatEther(user1Stake), "CORE");
  console.log("   User2 stake:", ethers.formatEther(user2Stake), "CORE");
  console.log("   Total pool:", ethers.formatEther(totalStakes), "CORE");
  console.log("");

  // Settle duel (User1 wins)
  console.log("🏆 Settling duel (User1 wins)...");
  try {
    const settleTx = await contract.connect(owner).settleDuel(duelId, user1.address, user2.address, {
      gasLimit: 250000,
      gasPrice: ethers.parseUnits("1", "gwei")
    });
    const receipt = await settleTx.wait();
    console.log("   ✅ Duel settled in block:", receipt.blockNumber);
    console.log("   🔗 Transaction:", "https://scan.test.btcs.network/tx/" + settleTx.hash);
  } catch (error) {
    console.log("❌ Settlement failed:", error.message);
    return;
  }

  // Wait for blockchain update
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check platform balance after settlement
  const platformBalanceAfter = await provider.getBalance(platformAddress);
  console.log("");
  console.log("📊 Platform balance AFTER:", ethers.formatEther(platformBalanceAfter), "CORE");
  
  // Calculate platform fee received
  const platformFeeReceived = platformBalanceAfter - platformBalanceBefore;
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

  console.log("");
  console.log("🔍 Final Status:");
  
  // Check that stakes are cleared
  const user1StakeAfter = await contract.getStake(duelId, user1.address);
  const user2StakeAfter = await contract.getStake(duelId, user2.address);
  
  console.log("   Stakes cleared:", (user1StakeAfter === 0n && user2StakeAfter === 0n) ? "✅ YES" : "❌ NO");
  console.log("   Platform fee received:", feeCorrect ? "✅ YES" : "❌ NO");
  
  if (feeCorrect) {
    console.log("");
    console.log("🎉 MICRO TEST: SUCCESS!");
    console.log("✅ Platform wallet is receiving 10% fees correctly!");
    console.log("");
    console.log("📋 Revenue Model Verified:");
    console.log("   Revenue this test:", ethers.formatEther(platformFeeReceived), "CORE");
    console.log("   Rate: 10% of each duel");
    console.log("   Platform wallet:", platformAddress);
  } else {
    console.log("");
    console.log("❌ MICRO TEST: FAILED");
    console.log("Platform fees are not working correctly!");
  }
  
  console.log("");
  console.log("🔗 Check platform wallet:");
  console.log("   https://scan.test.btcs.network/address/" + platformAddress);
  
  // Show remaining owner balance
  const ownerBalanceFinal = await provider.getBalance(owner.address);
  console.log("");
  console.log("📊 Remaining owner balance:", ethers.formatEther(ownerBalanceFinal), "CORE");
  
  // Calculate if we can run more tests
  const costThisTest = ownerBalance - ownerBalanceFinal;
  const possibleTests = Math.floor(Number(ownerBalanceFinal) / Number(costThisTest));
  console.log("   Estimated tests possible:", possibleTests);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
