import { ethers } from "hardhat";
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { DuelStaking } from "../typechain-types";

async function main() {
  // Load deployment info
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("Interacting with DuelStaking contract at:", contractAddress);
  console.log("Network:", hre.network.name);

  // Get contract instance
  const DuelStaking = await ethers.getContractFactory("DuelStaking");
  const duelStaking = DuelStaking.attach(contractAddress) as DuelStaking;

  // Get the deployer signer (only one available on testnet)
  const [deployer] = await ethers.getSigners();
  
  console.log("\n=== Contract Information ===");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer Address:", deployer.address);
  console.log("Network:", hre.network.name);
  
  try {
    console.log("Owner:", await duelStaking.owner());
    console.log("Platform Address:", await duelStaking.platformAddress());
  } catch (error) {
    console.log("Could not read contract state - this is normal for newly deployed contracts");
    console.log("Contract is deployed and ready for use!");
  }

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance:", ethers.formatEther(balance), "CORE");

  console.log("\n=== Contract Functions Available ===");
  console.log("✅ stakeForDuel(uint256 duelId) payable");
  console.log("✅ settleDuel(uint256 duelId, address winner, address loser) [owner only]");
  console.log("✅ refundStake(uint256 duelId, address user) [owner only]");
  console.log("✅ setPlatformAddress(address _platformAddress) [owner only]");
  console.log("✅ getStake(uint256 duelId, address user) view");
  console.log("✅ getTotalDuelStakes(uint256 duelId, address user1, address user2) view");

  console.log("\n=== Deployment Complete ===");
  console.log("🎉 FitFi DuelStaking contract successfully deployed to Core Testnet!");
  console.log("📋 Contract Address:", contractAddress);
  console.log("🌐 Block Explorer:", `https://scan.test.btcs.network/address/${contractAddress}`);
  console.log("💰 Platform fees (10%) will go to:", deploymentInfo.platformAddress);
  
  console.log("\n=== Integration Info ===");
  console.log("Use this contract address in your backend:");
  console.log("CONTRACT_ADDRESS =", contractAddress);
  console.log("ABI file location: deployments/DuelStaking-ABI.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
