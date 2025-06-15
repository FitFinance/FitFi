// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DuelStaking
 * @dev Smart contract for FitFi platform that manages staking and reward distribution for fitness duels
 * @notice This contract enables users to stake tokens for duels and distributes rewards based on outcomes
 */
contract DuelStaking is Ownable, ReentrancyGuard {
    // Mapping to track stakes: duelId -> user address -> amount staked
    mapping(uint256 => mapping(address => uint256)) public duelStakes;
    
    // Address where platform fees are sent
    address public platformAddress;

    // Events for logging actions
    event StakePlaced(uint256 indexed duelId, address indexed user, uint256 amount);
    event DuelSettled(uint256 indexed duelId, address winner, address loser, uint256 winnerShare, uint256 platformShare, uint256 loserShare);
    event StakeRefunded(uint256 indexed duelId, address indexed user, uint256 amount);
    event PlatformAddressUpdated(address oldAddress, address newAddress);

    /**
     * @dev Constructor sets initial platform address
     * @param _platformAddress Address that will receive platform fees (10% of each duel)
     */
    constructor(address _platformAddress) Ownable(msg.sender) {
        require(_platformAddress != address(0), "Invalid platform address");
        platformAddress = _platformAddress;
    }

    /**
     * @dev Allows users to stake tokens for a specific duel
     * @param duelId Unique identifier for the duel
     * @notice Users can stake multiple times for the same duel, amounts will accumulate
     */
    function stakeForDuel(uint256 duelId) external payable {
        require(msg.value > 0, "Must stake some tokens");
        duelStakes[duelId][msg.sender] += msg.value;
        emit StakePlaced(duelId, msg.sender, msg.value);
    }

    /**
     * @dev Settles a duel and distributes rewards according to the 85/10/5 split
     * @param duelId Unique identifier for the duel to settle
     * @param winner Address of the duel winner (gets 85%)
     * @param loser Address of the duel loser (gets 5%)
     * @notice Only owner can call this function after determining duel outcome
     */
    function settleDuel(uint256 duelId, address winner, address loser) external onlyOwner nonReentrant {
        require(winner != address(0) && loser != address(0), "Invalid addresses");
        require(winner != loser, "Winner and loser must be different");

        uint256 totalStakes = duelStakes[duelId][winner] + duelStakes[duelId][loser];
        require(totalStakes > 0, "No stakes for this duel");

        // Calculate reward shares: 85% winner, 10% platform, 5% loser
        uint256 winnerShare = (totalStakes * 85) / 100;
        uint256 platformShare = (totalStakes * 10) / 100;
        uint256 loserShare = (totalStakes * 5) / 100;
        
        // Add any remainder to winner to ensure all tokens are distributed
        uint256 remaining = totalStakes - (winnerShare + platformShare + loserShare);
        winnerShare += remaining;

        // Transfer rewards using low-level call for better gas efficiency
        (bool sentWinner, ) = winner.call{value: winnerShare}("");
        require(sentWinner, "Failed to send to winner");
        
        (bool sentPlatform, ) = platformAddress.call{value: platformShare}("");
        require(sentPlatform, "Failed to send to platform");
        
        (bool sentLoser, ) = loser.call{value: loserShare}("");
        require(sentLoser, "Failed to send to loser");

        // Clear stakes after successful distribution
        delete duelStakes[duelId][winner];
        delete duelStakes[duelId][loser];

        emit DuelSettled(duelId, winner, loser, winnerShare, platformShare, loserShare);
    }

    /**
     * @dev Refunds a user's stake for a specific duel (used for canceled duels)
     * @param duelId Unique identifier for the duel
     * @param user Address of the user to refund
     * @notice Only owner can call this function
     */
    function refundStake(uint256 duelId, address user) external onlyOwner nonReentrant {
        uint256 amount = duelStakes[duelId][user];
        require(amount > 0, "No stake to refund");

        delete duelStakes[duelId][user];
        (bool sent, ) = user.call{value: amount}("");
        require(sent, "Failed to send refund");

        emit StakeRefunded(duelId, user, amount);
    }

    /**
     * @dev Updates the platform address
     * @param _newPlatformAddress New address for platform fee collection
     * @notice Only owner can call this function
     */
    function setPlatformAddress(address _newPlatformAddress) external onlyOwner {
        require(_newPlatformAddress != address(0), "Invalid address");
        address oldAddress = platformAddress;
        platformAddress = _newPlatformAddress;
        emit PlatformAddressUpdated(oldAddress, _newPlatformAddress);
    }

    /**
     * @dev Gets the stake amount for a specific user in a specific duel
     * @param duelId Unique identifier for the duel
     * @param user Address of the user
     * @return The amount staked by the user for the duel
     */
    function getStake(uint256 duelId, address user) external view returns (uint256) {
        return duelStakes[duelId][user];
    }

    /**
     * @dev Gets the total stakes for a duel between two specific users
     * @param duelId Unique identifier for the duel
     * @param user1 Address of the first user
     * @param user2 Address of the second user
     * @return The total amount staked by both users for the duel
     */
    function getTotalDuelStakes(uint256 duelId, address user1, address user2) external view returns (uint256) {
        return duelStakes[duelId][user1] + duelStakes[duelId][user2];
    }
}
