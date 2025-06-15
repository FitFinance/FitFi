import { expect } from "chai";
import { ethers } from "hardhat";
import { DuelStaking } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("DuelStaking Contract", function () {
  let duelStaking: DuelStaking;
  let owner: SignerWithAddress;
  let platform: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  
  const stakeAmount = ethers.parseEther("10.0");
  const duelId = 1;

  beforeEach(async function () {
    [owner, platform, user1, user2, user3] = await ethers.getSigners();
    
    const DuelStaking = await ethers.getContractFactory("DuelStaking");
    duelStaking = await DuelStaking.deploy(platform.address);
    await duelStaking.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct platform address", async function () {
      expect(await duelStaking.platformAddress()).to.equal(platform.address);
    });

    it("Should set the correct owner", async function () {
      expect(await duelStaking.owner()).to.equal(owner.address);
    });

    it("Should revert if platform address is zero", async function () {
      const DuelStaking = await ethers.getContractFactory("DuelStaking");
      await expect(
        DuelStaking.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid platform address");
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake for a duel", async function () {
      await expect(duelStaking.connect(user1).stakeForDuel(duelId, { value: stakeAmount }))
        .to.emit(duelStaking, "StakePlaced")
        .withArgs(duelId, user1.address, stakeAmount);

      expect(await duelStaking.getStake(duelId, user1.address)).to.equal(stakeAmount);
    });

    it("Should revert if staking 0 tokens", async function () {
      await expect(duelStaking.connect(user1).stakeForDuel(duelId, { value: 0 }))
        .to.be.revertedWith("Must stake some tokens");
    });

    it("Should accumulate stakes if user stakes multiple times", async function () {
      const firstStake = ethers.parseEther("5.0");
      const secondStake = ethers.parseEther("3.0");

      await duelStaking.connect(user1).stakeForDuel(duelId, { value: firstStake });
      await duelStaking.connect(user1).stakeForDuel(duelId, { value: secondStake });

      expect(await duelStaking.getStake(duelId, user1.address)).to.equal(
        firstStake + secondStake
      );
    });

    it("Should track stakes for multiple users in the same duel", async function () {
      await duelStaking.connect(user1).stakeForDuel(duelId, { value: stakeAmount });
      await duelStaking.connect(user2).stakeForDuel(duelId, { value: stakeAmount });

      expect(await duelStaking.getStake(duelId, user1.address)).to.equal(stakeAmount);
      expect(await duelStaking.getStake(duelId, user2.address)).to.equal(stakeAmount);
      expect(await duelStaking.getTotalDuelStakes(duelId, user1.address, user2.address))
        .to.equal(stakeAmount * 2n);
    });
  });

  describe("Duel Settlement", function () {
    beforeEach(async function () {
      // Set up a duel with both users staking
      await duelStaking.connect(user1).stakeForDuel(duelId, { value: stakeAmount });
      await duelStaking.connect(user2).stakeForDuel(duelId, { value: stakeAmount });
    });

    it("Should correctly distribute rewards when settling a duel", async function () {
      const initialBalance1 = await ethers.provider.getBalance(user1.address);
      const initialBalance2 = await ethers.provider.getBalance(user2.address);
      const initialPlatformBalance = await ethers.provider.getBalance(platform.address);

      await expect(duelStaking.settleDuel(duelId, user1.address, user2.address))
        .to.emit(duelStaking, "DuelSettled");

      const finalBalance1 = await ethers.provider.getBalance(user1.address);
      const finalBalance2 = await ethers.provider.getBalance(user2.address);
      const finalPlatformBalance = await ethers.provider.getBalance(platform.address);

      // Winner should get 85% (17 tokens out of 20)
      expect(finalBalance1 - initialBalance1).to.equal(ethers.parseEther("17.0"));
      // Loser should get 5% (1 token out of 20)
      expect(finalBalance2 - initialBalance2).to.equal(ethers.parseEther("1.0"));
      // Platform should get 10% (2 tokens out of 20)
      expect(finalPlatformBalance - initialPlatformBalance).to.equal(ethers.parseEther("2.0"));
    });

    it("Should emit DuelSettled event with correct parameters", async function () {
      const totalStakes = stakeAmount * 2n;
      const winnerShare = (totalStakes * 85n) / 100n;
      const platformShare = (totalStakes * 10n) / 100n;
      const loserShare = (totalStakes * 5n) / 100n;

      await expect(duelStaking.settleDuel(duelId, user1.address, user2.address))
        .to.emit(duelStaking, "DuelSettled")
        .withArgs(duelId, user1.address, user2.address, winnerShare, platformShare, loserShare);
    });

    it("Should clear stakes after settlement", async function () {
      await duelStaking.settleDuel(duelId, user1.address, user2.address);

      expect(await duelStaking.getStake(duelId, user1.address)).to.equal(0);
      expect(await duelStaking.getStake(duelId, user2.address)).to.equal(0);
    });

    it("Should only allow owner to settle duels", async function () {
      await expect(duelStaking.connect(user1).settleDuel(duelId, user1.address, user2.address))
        .to.be.revertedWithCustomError(duelStaking, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);
    });

    it("Should revert if winner and loser are the same", async function () {
      await expect(duelStaking.settleDuel(duelId, user1.address, user1.address))
        .to.be.revertedWith("Winner and loser must be different");
    });

    it("Should revert if addresses are zero", async function () {
      await expect(duelStaking.settleDuel(duelId, ethers.ZeroAddress, user2.address))
        .to.be.revertedWith("Invalid addresses");
      
      await expect(duelStaking.settleDuel(duelId, user1.address, ethers.ZeroAddress))
        .to.be.revertedWith("Invalid addresses");
    });

    it("Should revert if no stakes exist for the duel", async function () {
      const emptyDuelId = 999;
      await expect(duelStaking.settleDuel(emptyDuelId, user1.address, user2.address))
        .to.be.revertedWith("No stakes for this duel");
    });

    it("Should handle uneven stake amounts correctly", async function () {
      const newDuelId = 2;
      const smallStake = ethers.parseEther("3.0");
      const largeStake = ethers.parseEther("7.0");

      await duelStaking.connect(user1).stakeForDuel(newDuelId, { value: smallStake });
      await duelStaking.connect(user2).stakeForDuel(newDuelId, { value: largeStake });

      const initialBalance1 = await ethers.provider.getBalance(user1.address);
      const initialBalance2 = await ethers.provider.getBalance(user2.address);
      const initialPlatformBalance = await ethers.provider.getBalance(platform.address);

      await duelStaking.settleDuel(newDuelId, user1.address, user2.address);

      const finalBalance1 = await ethers.provider.getBalance(user1.address);
      const finalBalance2 = await ethers.provider.getBalance(user2.address);
      const finalPlatformBalance = await ethers.provider.getBalance(platform.address);

      const totalStakes = smallStake + largeStake; // 10 ETH
      
      // Winner gets 85% = 8.5 ETH
      expect(finalBalance1 - initialBalance1).to.equal(ethers.parseEther("8.5"));
      // Loser gets 5% = 0.5 ETH  
      expect(finalBalance2 - initialBalance2).to.equal(ethers.parseEther("0.5"));
      // Platform gets 10% = 1 ETH
      expect(finalPlatformBalance - initialPlatformBalance).to.equal(ethers.parseEther("1.0"));
    });
  });

  describe("Stake Refunding", function () {
    it("Should allow owner to refund stakes", async function () {
      await duelStaking.connect(user1).stakeForDuel(duelId, { value: stakeAmount });

      const initialBalance = await ethers.provider.getBalance(user1.address);
      
      await expect(duelStaking.refundStake(duelId, user1.address))
        .to.emit(duelStaking, "StakeRefunded")
        .withArgs(duelId, user1.address, stakeAmount);

      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance - initialBalance).to.equal(stakeAmount);
      expect(await duelStaking.getStake(duelId, user1.address)).to.equal(0);
    });

    it("Should revert if no stake to refund", async function () {
      await expect(duelStaking.refundStake(duelId, user1.address))
        .to.be.revertedWith("No stake to refund");
    });

    it("Should only allow owner to refund stakes", async function () {
      await duelStaking.connect(user1).stakeForDuel(duelId, { value: stakeAmount });
      
      await expect(duelStaking.connect(user1).refundStake(duelId, user1.address))
        .to.be.revertedWithCustomError(duelStaking, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);
    });
  });

  describe("Platform Address Management", function () {
    it("Should allow owner to update platform address", async function () {
      await expect(duelStaking.setPlatformAddress(user3.address))
        .to.emit(duelStaking, "PlatformAddressUpdated")
        .withArgs(platform.address, user3.address);

      expect(await duelStaking.platformAddress()).to.equal(user3.address);
    });

    it("Should revert if setting platform address to zero", async function () {
      await expect(duelStaking.setPlatformAddress(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid address");
    });

    it("Should only allow owner to update platform address", async function () {
      await expect(duelStaking.connect(user1).setPlatformAddress(user3.address))
        .to.be.revertedWithCustomError(duelStaking, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);
    });
  });

  describe("View Functions", function () {
    it("Should return correct stake for user", async function () {
      expect(await duelStaking.getStake(duelId, user1.address)).to.equal(0);
      
      await duelStaking.connect(user1).stakeForDuel(duelId, { value: stakeAmount });
      expect(await duelStaking.getStake(duelId, user1.address)).to.equal(stakeAmount);
    });

    it("Should return correct total stakes for a duel", async function () {
      expect(await duelStaking.getTotalDuelStakes(duelId, user1.address, user2.address)).to.equal(0);
      
      await duelStaking.connect(user1).stakeForDuel(duelId, { value: stakeAmount });
      await duelStaking.connect(user2).stakeForDuel(duelId, { value: stakeAmount });
      
      expect(await duelStaking.getTotalDuelStakes(duelId, user1.address, user2.address))
        .to.equal(stakeAmount * 2n);
    });
  });
});
