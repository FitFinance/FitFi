const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔧 Update Platform Address");
  console.log("=" .repeat(40));

  // Load deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync('deployments/core_testnet-deployment.json', 'utf8'));
  const contractAddress = deploymentInfo.contractAddress;
  
  console.log("Contract:", contractAddress);
  console.log("Current platform:", deploymentInfo.platformAddress);
  console.log("");

  // Connect as owner
  const provider = new ethers.JsonRpcProvider("https://rpc.test.btcs.network");
  const owner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("Owner:", owner.address);
  
  // Load contract
  const DuelStaking = await ethers.getContractFactory("DuelStaking");
  const contract = DuelStaking.attach(contractAddress);

  // Prompt for new platform address
  console.log("📝 To update platform address:");
  console.log("1. Uncomment the line below");
  console.log("2. Replace with your actual wallet address");
  console.log("3. Run this script");
  console.log("");
  
  // UNCOMMENT AND REPLACE WITH YOUR WALLET ADDRESS:
  // const newPlatformAddress = "0xYourWalletAddressHere";
  
  // Verify current platform address
  const currentPlatform = await contract.platformAddress();
  console.log("✅ Current platform address:", currentPlatform);
  
  // To update (uncomment when ready):
  /*
  console.log("🔄 Updating platform address to:", newPlatformAddress);
  const tx = await contract.setPlatformAddress(newPlatformAddress);
  await tx.wait();
  console.log("✅ Platform address updated!");
  console.log("Transaction:", tx.hash);
  */
  
  console.log("");
  console.log("💡 Make sure the new address is a wallet you control!");
}

main().catch(console.error);
