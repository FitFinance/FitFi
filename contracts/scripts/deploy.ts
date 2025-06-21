import { ethers } from "hardhat";
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Get platform address from environment
  const platformAddress = process.env.PLATFORM_ADDRESS;
  if (!platformAddress) {
    throw new Error("PLATFORM_ADDRESS not set in environment variables");
  }

  console.log("Platform address:", platformAddress);

  // Deploy DuelStaking contract
  console.log("Deploying DuelStaking contract...");
  const DuelStaking = await ethers.getContractFactory("DuelStaking");
  const duelStaking = await DuelStaking.deploy(platformAddress);

  await duelStaking.waitForDeployment();
  const contractAddress = await duelStaking.getAddress();

  console.log("DuelStaking deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    platformAddress: platformAddress,
    deployerAddress: deployer.address,
    network: hre.network.name,
    deploymentTime: new Date().toISOString(),
    transactionHash: duelStaking.deploymentTransaction()?.hash
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("Deployment Info saved to:", deploymentFile);
  console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));

  // Wait for a few confirmations before verification (only on live networks)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for 6 confirmations...");
    await duelStaking.deploymentTransaction()?.wait(6);
    console.log("Contract deployment confirmed!");
  }

  // Save contract ABI for backend integration
  const contractABI = JSON.stringify(DuelStaking.interface.format(), null, 2);
  const abiFile = path.join(deploymentsDir, `DuelStaking-ABI.json`);
  fs.writeFileSync(abiFile, contractABI);
  console.log("Contract ABI saved to:", abiFile);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
