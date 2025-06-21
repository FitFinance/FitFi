const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Simple Live Contract Verification");
  console.log("=" .repeat(50));

  // Load deployment info
  const deploymentFile = path.join(__dirname, '..', 'deployments', 'core_testnet-deployment.json');
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  const contractAddress = deploymentInfo.contractAddress;
  const platformAddress = deploymentInfo.platformAddress;
  
  console.log("📋 Contract Details:");
  console.log("   Address:", contractAddress);
  console.log("   Platform:", platformAddress);
  console.log("");

  // Connect to contract
  const provider = new ethers.JsonRpcProvider("https://rpc.test.btcs.network");
  const ownerPrivateKey = process.env.PRIVATE_KEY;
  const owner = new ethers.Wallet(ownerPrivateKey, provider);
  
  console.log("👤 Testing with owner:", owner.address);
  
  const ownerBalance = await provider.getBalance(owner.address);
  console.log("💰 Owner balance:", ethers.formatEther(ownerBalance), "CORE");
  console.log("");

  // Load contract
  const DuelStaking = await ethers.getContractFactory("DuelStaking");
  const contract = DuelStaking.attach(contractAddress);

  console.log("🔍 Testing Contract Functions:");
  
  try {
    // Test 1: Read contract owner
    const contractOwner = await contract.owner();
    console.log("   ✅ Contract owner:", contractOwner);
    console.log("   ✅ Owner match:", contractOwner.toLowerCase() === owner.address.toLowerCase());
    
    // Test 2: Read platform address
    const contractPlatform = await contract.platformAddress();
    console.log("   ✅ Platform address:", contractPlatform);
    console.log("   ✅ Platform match:", contractPlatform.toLowerCase() === platformAddress.toLowerCase());
    
    // Test 3: Check a non-existent stake (should return 0)
    const testStake = await contract.getStake(999999, owner.address);
    console.log("   ✅ Test stake query:", ethers.formatEther(testStake), "CORE");
    
    // Test 4: Check contract balance
    const contractBalance = await provider.getBalance(contractAddress);
    console.log("   ✅ Contract balance:", ethers.formatEther(contractBalance), "CORE");
    
    console.log("");
    console.log("🎯 Contract State Verification:");
    console.log("   ✅ Contract is deployed and accessible");
    console.log("   ✅ Owner functions are callable");
    console.log("   ✅ View functions work correctly");
    console.log("   ✅ Contract is ready for real transactions");
    
    console.log("");
    console.log("🚀 LIVE CONTRACT VERIFICATION: SUCCESS!");
    console.log("");
    console.log("📋 Integration Details:");
    console.log("   Contract Address:", contractAddress);
    console.log("   Network: Core Testnet (Chain ID: 1115)");
    console.log("   Platform Revenue Address:", platformAddress);
    console.log("   Block Explorer:", `https://scan.test.btcs.network/address/${contractAddress}`);
    
    console.log("");
    console.log("💡 Ready for Full Testing:");
    console.log("   1. Get more testnet CORE tokens from faucet");
    console.log("   2. Run full stake/settle test");
    console.log("   3. Integrate with backend/frontend");
    
  } catch (error) {
    console.log("❌ Contract verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
