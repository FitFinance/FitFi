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

  // Get contract instance
  const DuelStaking = await ethers.getContractFactory("DuelStaking");
  const duelStaking = DuelStaking.attach(contractAddress) as DuelStaking;

  // Get signers
  const [owner, platform, user1, user2] = await ethers.getSigners();

  console.log("\n=== Contract Information ===");
  console.log("Owner:", await duelStaking.owner());
  console.log("Platform Address:", await duelStaking.platformAddress());

  // Simulate a duel
  const duelId = 1;
  const stakeAmount = ethers.parseEther("1.0");

  console.log("\n=== Simulating a Duel ===");
  console.log("Duel ID:", duelId);
  console.log("Stake Amount:", ethers.formatEther(stakeAmount), "ETH");

  // User1 stakes
  console.log("\nUser1 staking...");
  const tx1 = await duelStaking.connect(user1).stakeForDuel(duelId, { value: stakeAmount });
  await tx1.wait();
  console.log("User1 stake placed. Transaction:", tx1.hash);

  // User2 stakes
  console.log("\nUser2 staking...");
  const tx2 = await duelStaking.connect(user2).stakeForDuel(duelId, { value: stakeAmount });
  await tx2.wait();
  console.log("User2 stake placed. Transaction:", tx2.hash);

  // Check stakes
  const user1Stake = await duelStaking.getStake(duelId, user1.address);
  const user2Stake = await duelStaking.getStake(duelId, user2.address);
  const totalStakes = await duelStaking.getTotalDuelStakes(duelId, user1.address, user2.address);

  console.log("\n=== Current Stakes ===");
  console.log("User1 stake:", ethers.formatEther(user1Stake), "ETH");
  console.log("User2 stake:", ethers.formatEther(user2Stake), "ETH");
  console.log("Total stakes:", ethers.formatEther(totalStakes), "ETH");

  // Get balances before settlement
  const user1BalanceBefore = await ethers.provider.getBalance(user1.address);
  const user2BalanceBefore = await ethers.provider.getBalance(user2.address);
  const platformBalanceBefore = await ethers.provider.getBalance(platform.address);

  console.log("\n=== Balances Before Settlement ===");
  console.log("User1 balance:", ethers.formatEther(user1BalanceBefore), "ETH");
  console.log("User2 balance:", ethers.formatEther(user2BalanceBefore), "ETH");
  console.log("Platform balance:", ethers.formatEther(platformBalanceBefore), "ETH");

  // Settle duel (User1 wins)
  console.log("\n=== Settling Duel (User1 wins) ===");
  const settleTx = await duelStaking.settleDuel(duelId, user1.address, user2.address);
  const receipt = await settleTx.wait();
  console.log("Duel settled. Transaction:", settleTx.hash);

  // Get balances after settlement
  const user1BalanceAfter = await ethers.provider.getBalance(user1.address);
  const user2BalanceAfter = await ethers.provider.getBalance(user2.address);
  const platformBalanceAfter = await ethers.provider.getBalance(platform.address);

  console.log("\n=== Balances After Settlement ===");
  console.log("User1 balance:", ethers.formatEther(user1BalanceAfter), "ETH");
  console.log("User2 balance:", ethers.formatEther(user2BalanceAfter), "ETH");
  console.log("Platform balance:", ethers.formatEther(platformBalanceAfter), "ETH");

  console.log("\n=== Rewards Distribution ===");
  console.log("User1 (Winner) gained:", ethers.formatEther(user1BalanceAfter - user1BalanceBefore), "ETH");
  console.log("User2 (Loser) gained:", ethers.formatEther(user2BalanceAfter - user2BalanceBefore), "ETH");
  console.log("Platform gained:", ethers.formatEther(platformBalanceAfter - platformBalanceBefore), "ETH");

  // Check that stakes are cleared
  const user1StakeAfter = await duelStaking.getStake(duelId, user1.address);
  const user2StakeAfter = await duelStaking.getStake(duelId, user2.address);

  console.log("\n=== Stakes After Settlement ===");
  console.log("User1 stake:", ethers.formatEther(user1StakeAfter), "ETH");
  console.log("User2 stake:", ethers.formatEther(user2StakeAfter), "ETH");

  // Check events
  console.log("\n=== Events Emitted ===");
  if (receipt) {
    const duelSettledEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = duelStaking.interface.parseLog({ topics: log.topics as string[], data: log.data });
        return parsed?.name === 'DuelSettled';
      } catch {
        return false;
      }
    });

    if (duelSettledEvent) {
      const parsedEvent = duelStaking.interface.parseLog({ 
        topics: duelSettledEvent.topics as string[], 
        data: duelSettledEvent.data 
      });
      if (parsedEvent) {
        console.log("DuelSettled event:");
        console.log("  DuelId:", parsedEvent.args.duelId.toString());
        console.log("  Winner:", parsedEvent.args.winner);
        console.log("  Loser:", parsedEvent.args.loser);
        console.log("  Winner Share:", ethers.formatEther(parsedEvent.args.winnerShare), "ETH");
        console.log("  Platform Share:", ethers.formatEther(parsedEvent.args.platformShare), "ETH");
        console.log("  Loser Share:", ethers.formatEther(parsedEvent.args.loserShare), "ETH");
      }
    }
  }

  console.log("\n=== Simulation Complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
