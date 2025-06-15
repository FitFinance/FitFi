require('dotenv').config();
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying FitFi to Core Testnet 2 (Chain ID 1114)");
  console.log("=" .repeat(60));

  // Get deployer
  const [deployer] = await ethers.getSigners();
  const platformAddress = process.env.PLATFORM_ADDRESS;

  console.log("📋 Deployment Configuration:");
  console.log("   Deploying contracts with account:", deployer.address);
  console.log("   Platform address:", platformAddress);
  console.log("   Network: Core Testnet 2 (1114)");

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("   Account balance:", ethers.formatEther(balance), "tCORE2");

  if (!platformAddress) {
    throw new Error("PLATFORM_ADDRESS not set in .env file");
  }

  if (balance < ethers.parseEther("0.01")) {
    console.log("❌ Need at least 0.01 tCORE2 for deployment");
    console.log("   Get tokens from Core Testnet 2 faucet");
    return;
  }

  // Deploy DuelStaking contract
  console.log("");
  console.log("🏗️ Deploying DuelStaking contract...");
  
  const DuelStaking = await ethers.getContractFactory("DuelStaking");
  const duelStaking = await DuelStaking.deploy(platformAddress);
  
  await duelStaking.waitForDeployment();
  const contractAddress = await duelStaking.getAddress();

  console.log("   ✅ DuelStaking deployed to:", contractAddress);

  // Get deployment transaction
  const deploymentTx = duelStaking.deploymentTransaction();
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    platformAddress: platformAddress,
    deployerAddress: deployer.address,
    network: "core_testnet_2",
    chainId: 1114,
    deploymentTime: new Date().toISOString(),
    transactionHash: deploymentTx?.hash || "unknown"
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, 'core_testnet_2-deployment.json');
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("");
  console.log("📁 Deployment Info saved to:", deploymentFile);
  console.log("📊 Deployment Details:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("");
  console.log("🎉 SUCCESS! FitFi deployed to Core Testnet 2!");
  console.log("   📋 Contract Address:", contractAddress);
  console.log("   🔗 Add to MetaMask with Chain ID: 1114");
  console.log("   💰 Platform fees will go to:", platformAddress);
  console.log("");
  console.log("📱 MetaMask Setup:");
  console.log("   Network Name: Core Testnet 2");
  console.log("   RPC URL: https://rpc.test.btcs.network");
  console.log("   Chain ID: 1114");
  console.log("   Currency: tCORE2");
  console.log("");
  console.log("🧪 Next Step: Run nano test to verify platform fees");
  console.log("   npx hardhat run scripts/core-testnet-2-nano-test.js --network core_testnet_2");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
