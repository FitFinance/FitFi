require('dotenv').config();
const { ethers } = require("ethers"); // Use ethers directly instead of hardhat

async function main() {
  console.log("🔍 Checking Core Testnet 2 Balance");
  console.log("=" .repeat(40));

  // Connect to Core Testnet 2
  const provider = new ethers.JsonRpcProvider("https://rpc.test2.btcs.network/");
  
  // Setup owner wallet
  const ownerPrivateKey = process.env.PRIVATE_KEY;
  const owner = new ethers.Wallet(ownerPrivateKey, provider);
  
  console.log("👤 Wallet Address:", owner.address);
  
  try {
    // Check balance
    const balance = await provider.getBalance(owner.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "tCORE2");
    
    // Check network info
    const network = await provider.getNetwork();
    console.log("🌐 Network Info:");
    console.log("   Chain ID:", network.chainId.toString());
    console.log("   Network Name:", network.name);
    
    if (balance === 0n) {
      console.log("");
      console.log("❌ No tCORE2 tokens found!");
      console.log("🚰 Get tokens from the faucet:");
      console.log("   https://scan.test2.btcs.network/faucet");
      console.log("   Address to fund:", owner.address);
    } else {
      console.log("");
      console.log("✅ You have tCORE2 tokens!");
      if (balance >= ethers.parseEther("0.1")) {
        console.log("💚 Sufficient balance for deployment");
      } else {
        console.log("⚠️  Low balance - consider getting more from faucet");
      }
    }
    
  } catch (error) {
    console.log("❌ Error checking balance:", error.message);
    console.log("");
    console.log("🔧 Possible issues:");
    console.log("   - RPC endpoint not responding");
    console.log("   - Network connectivity issue");
    console.log("   - Incorrect RPC URL");
  }
  
  console.log("");
  console.log("🔗 Useful Links:");
  console.log("   Explorer: https://scan.test2.btcs.network");
  console.log("   Faucet: https://scan.test2.btcs.network/faucet");
  console.log("   Add to MetaMask:");
  console.log("     Network: Core Testnet 2");
  console.log("     RPC: https://rpc.test2.btcs.network/");
  console.log("     Chain ID: 1114");
  console.log("     Symbol: tCORE2");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
