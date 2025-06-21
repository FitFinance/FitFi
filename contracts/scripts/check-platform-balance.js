const { ethers } = require("hardhat");

async function main() {
  console.log("🏦 Platform Wallet Balance Check");
  console.log("================================");

  // Platform address from deployment
  const platformAddress = "0xFeA68598eEAd1Ae974A0Da5bcFAc197e9c165fE1";
  
  // Connect to Core Testnet
  const provider = new ethers.JsonRpcProvider("https://rpc.test.btcs.network");
  
  // Get platform balance
  const balance = await provider.getBalance(platformAddress);
  
  console.log("📋 Platform Wallet Info:");
  console.log("   Address:", platformAddress);
  console.log("   Balance:", ethers.formatEther(balance), "tCORE");
  console.log("   Balance (wei):", balance.toString());
  
  // Calculate revenue in USD equivalent (assuming 1 CORE = $1 for example)
  const balanceNum = parseFloat(ethers.formatEther(balance));
  console.log("   Balance (decimal):", balanceNum);
  
  if (balanceNum > 0) {
    console.log("");
    console.log("💰 Revenue Analysis:");
    console.log("   ✅ Platform has earned fees!");
    console.log("   💵 Total collected:", ethers.formatEther(balance), "tCORE");
    
    // Calculate how many tests/duels this represents
    const feePerDuel = 0.001; // 0.001 tCORE per test (10% of 0.01 total stake)
    const estimatedDuels = Math.floor(balanceNum / feePerDuel);
    console.log("   📊 Estimated duels completed:", estimatedDuels);
    console.log("   📈 Average fee per duel: ~0.001 tCORE");
  } else {
    console.log("");
    console.log("💡 Platform Status:");
    console.log("   Balance is 0 - no fees collected yet");
    console.log("   This could mean:");
    console.log("   - No duels have been settled");
    console.log("   - Smart contract issue");
    console.log("   - Wrong platform address");
  }
  
  console.log("");
  console.log("🔗 Links:");
  console.log("   Explorer:", "https://scan.test.btcs.network/address/" + platformAddress);
  console.log("   Add to MetaMask: Copy address above");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Balance check failed:", error.message);
    process.exit(1);
  });
