# FitFi Smart Contracts - Move-to-Earn Fitness Platform

🏃‍♂️ **FitFi** is a decentralized move-to-earn fitness application that enables users to stake tokens for fitness duels with automated reward distribution on the Core blockchain.

## 🎯 Overview

FitFi implements a **peer-to-peer fitness challenge system** where:
- Users stake tokens to participate in fitness duels
- Winners receive **85% of the total stake pool**
- Platform automatically collects **10% revenue**
- Losers receive **5% consolation rewards**
- All distributions are automated via smart contracts

## 📋 Table of Contents

- [Features](#-features)
- [Smart Contract Architecture](#-smart-contract-architecture)
- [Deployment Status](#-deployment-status)
- [Network Support](#-network-support)
- [Revenue Model](#-revenue-model)
- [Security Features](#-security-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Testing](#-testing)
- [Integration](#-integration)
- [Contributing](#-contributing)

## ✨ Features

### Core Functionality
- **Stake-to-Duel System**: Users stake tokens to participate in fitness challenges
- **Automated Settlements**: Smart contract handles all reward distributions
- **Platform Revenue**: 10% automatic fee collection on every duel
- **Fair Distribution**: 85% winner, 10% platform, 5% loser split
- **Stake Management**: Secure staking with overflow protection
- **Refund System**: Emergency refund capabilities for stuck duels

### Technical Features
- **Reentrancy Protection**: OpenZeppelin ReentrancyGuard implementation
- **Access Control**: Owner-only settlement functions
- **Event Logging**: Comprehensive event emission for all actions
- **Gas Optimization**: Efficient contract design with 200 optimization runs
- **Multi-Network**: Deployed on multiple Core blockchain testnets

## 🏗️ Smart Contract Architecture

### Core Contract: `DuelStaking.sol`

```solidity
contract DuelStaking is ReentrancyGuard, Ownable {
    // Stake tracking
    mapping(uint256 => mapping(address => uint256)) public stakes;
    
    // Platform configuration
    address public platformAddress;
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 10;
    uint256 public constant LOSER_FEE_PERCENTAGE = 5;
    
    // Core functions
    function stakeForDuel(uint256 duelId) external payable nonReentrant
    function settleDuel(uint256 duelId, address winner, address loser) external onlyOwner nonReentrant
    function refundDuel(uint256 duelId, address user1, address user2) external onlyOwner nonReentrant
}
```

### Key Functions

#### `stakeForDuel(uint256 duelId)`
- Allows users to stake tokens for a specific duel
- Validates stake amounts and prevents double-staking
- Emits `StakePlaced` event

#### `settleDuel(uint256 duelId, address winner, address loser)`
- Owner-only function to settle completed duels
- Distributes rewards: 85% winner, 10% platform, 5% loser
- Clears stakes and emits `DuelSettled` event

#### `refundDuel(uint256 duelId, address user1, address user2)`
- Emergency function to refund stakes if duel cannot be completed
- Returns 100% of stakes to participants
- Emits `DuelRefunded` event

## 🚀 Deployment Status

### ✅ Core Testnet (Chain ID 1115)
- **Contract**: `0xD6D0F20D055748302877a2a635a22F5dD0d0433D`
- **Platform Wallet**: `0xFeA68598eEAd1Ae974A0Da5bcFAc197e9c165fE1`
- **Status**: ✅ Deployed & Tested
- **Revenue Collected**: 0.001 tCORE
- **Explorer**: [View Contract](https://scan.test.btcs.network/address/0xD6D0F20D055748302877a2a635a22F5dD0d0433D)

### ✅ Core Testnet 2 (Chain ID 1114) - **Primary Network**
- **Contract**: `0x8796071429e599a1ec631258dF4aEceA18cB9F69`
- **Platform Wallet**: `0xFeA68598eEAd1Ae974A0Da5bcFAc197e9c165fE1`
- **Status**: ✅ Deployed & Tested
- **Revenue Collected**: 0.001 tCORE2
- **Explorer**: [View Contract](https://scan.test2.btcs.network/address/0x8796071429e599a1ec631258dF4aEceA18cB9F69)

### 🧪 Localhost Development
- **Status**: ✅ Comprehensive test suite (23 tests passing)
- **Coverage**: 100% function coverage
- **Gas Reports**: Available for all functions

## 🌐 Network Support

### Core Testnet (Legacy)
```
Network Name: Core Testnet
RPC URL: https://rpc.test.btcs.network
Chain ID: 1115
Currency: tCORE
Explorer: https://scan.test.btcs.network
```

### Core Testnet 2 (Current)
```
Network Name: Core Testnet 2
RPC URL: https://rpc.test2.btcs.network/
Chain ID: 1114
Currency: tCORE2
Explorer: https://scan.test2.btcs.network
Faucet: https://scan.test2.btcs.network/faucet
```

## 💰 Revenue Model

### Automated Fee Distribution
```
Total Stake Pool: 100%
├── Winner: 85%
├── Platform: 10% (automatic revenue)
└── Loser: 5% (consolation)
```

### Revenue Analytics
- **Total Tests Conducted**: 2+ live tests
- **Platform Fees Collected**: 0.002 tCORE (across both networks)
- **Success Rate**: 100% (all fees collected correctly)
- **Average Test Cost**: ~0.02 tCORE per complete duel cycle

### Fee Calculation Example
```javascript
// For a 0.01 tCORE total stake pool (0.005 each user):
const totalStakes = 0.01; // tCORE
const platformFee = totalStakes * 0.10; // 0.001 tCORE
const winnerAmount = totalStakes * 0.85; // 0.0085 tCORE  
const loserAmount = totalStakes * 0.05;  // 0.0005 tCORE
```

## 🔒 Security Features

### OpenZeppelin Integration
- **ReentrancyGuard**: Prevents reentrancy attacks on all payable functions
- **Ownable**: Restricts settlement functions to contract owner only
- **SafeMath**: Built-in Solidity 0.8+ overflow protection

### Access Control
```solidity
modifier onlyOwner() // Settlement and refund functions
modifier nonReentrant() // All state-changing functions
```

### Input Validation
- Stake amount validation (must be > 0)
- Duplicate stake prevention
- Winner/loser address validation
- Duel existence verification

### Emergency Features
- **Refund System**: Owner can refund stuck duels
- **Platform Address Updates**: Configurable revenue destination
- **Event Logging**: Complete audit trail

## 🛠️ Installation

### Prerequisites
- Node.js v18+
- npm or yarn
- Git

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd fitfi/contracts

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your private key and platform address

# Compile contracts
npx hardhat compile
```

### Environment Configuration
```bash
# .env file
PRIVATE_KEY=your_private_key_here
PLATFORM_ADDRESS=0xFeA68598eEAd1Ae974A0Da5bcFAc197e9c165fE1
```

## 🎮 Usage

### Local Development
```bash
# Start local blockchain
npx hardhat node

# Deploy to localhost
npx hardhat run scripts/deploy.ts --network localhost

# Run tests
npx hardhat test
```

### Testnet Deployment
```bash
# Deploy to Core Testnet 2
npx hardhat run scripts/deploy-core-testnet-2.js --network core_testnet_2

# Verify deployment
npx hardhat run scripts/core-testnet-2-nano-test.js --network core_testnet_2
```

### Contract Interaction
```javascript
// Example: Stake for a duel
const contract = await ethers.getContractAt("DuelStaking", contractAddress);
await contract.stakeForDuel(duelId, { value: ethers.parseEther("0.1") });

// Example: Settle a duel (owner only)
await contract.settleDuel(duelId, winnerAddress, loserAddress);
```

## 🧪 Testing

### Test Suite Overview
- **23 passing tests** with 100% function coverage
- **Gas optimization** reports available
- **Edge case handling** thoroughly tested
- **Security scenarios** validated

### Run Tests
```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run specific test file
npx hardhat test test/DuelStaking.ts
```

### Live Testing
```bash
# Test platform fees on Core Testnet 2
npx hardhat run scripts/core-testnet-2-nano-test.js --network core_testnet_2

# Check platform wallet balance
node scripts/check-core-testnet-2-balance.js
```

## 🔗 Integration

### Backend Integration
```javascript
// Example Node.js integration
const { ethers } = require('ethers');
const contractABI = require('./deployments/DuelStaking-ABI.json');

const provider = new ethers.JsonRpcProvider('https://rpc.test2.btcs.network/');
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Listen for stake events
contract.on('StakePlaced', (duelId, user, amount) => {
    console.log(`User ${user} staked ${ethers.formatEther(amount)} for duel ${duelId}`);
});
```

### Frontend Integration
```javascript
// Example Web3 connection
import { ethers } from 'ethers';

const connectContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
};
```

## 📊 Performance Metrics

### Gas Costs (Optimized)
- **Stake Function**: ~60,000 gas
- **Settlement**: ~120,000 gas
- **Refund**: ~80,000 gas
- **Deployment**: ~1,200,000 gas

### Network Performance
- **Transaction Confirmation**: 2-5 seconds on Core Testnet 2
- **Block Time**: ~3 seconds
- **Network Fees**: <0.001 tCORE per transaction

## 🗂️ File Structure

```
contracts/
├── contracts/
│   └── DuelStaking.sol          # Main smart contract
├── scripts/
│   ├── deploy-core-testnet-2.js # Deployment script
│   ├── core-testnet-2-nano-test.js # Live testing
│   └── check-core-testnet-2-balance.js # Balance checker
├── test/
│   └── DuelStaking.ts           # Comprehensive test suite
├── deployments/
│   ├── core_testnet_2-deployment.json # Live deployment info
│   └── DuelStaking-ABI.json     # Contract ABI
├── hardhat.config.ts            # Network configuration
└── README.md                    # This file
```

## 🎯 Roadmap

### Phase 1: ✅ Complete
- [x] Smart contract development
- [x] Local testing suite
- [x] Testnet deployment
- [x] Live platform fee verification

### Phase 2: 🚀 Next Steps
- [ ] Mobile app frontend
- [ ] Backend API integration
- [ ] User authentication system
- [ ] Fitness tracking integration

### Phase 3: 🔮 Future
- [ ] Core Mainnet deployment
- [ ] Advanced staking pools
- [ ] NFT reward system
- [ ] Governance token

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Code Standards
- Solidity 0.8.28+
- OpenZeppelin contracts for security
- Comprehensive test coverage required
- Gas optimization considerations

## 📞 Support

### Resources
- **Documentation**: See `TEST.md` for detailed testing results
- **Examples**: Check `/examples` directory for integration samples
- **Issues**: Report bugs via GitHub issues

### Contact
- **Platform Wallet**: `0xFeA68598eEAd1Ae974A0Da5bcFAc197e9c165fE1`
- **Contract Owner**: `0xdA344FCAEc1F6E7F09d97A701C7436844F0deb95`

## 📄 License

MIT License - see LICENSE file for details.

---

**🎉 FitFi - Making Fitness Rewarding Through Blockchain Technology**

*Last Updated: June 14, 2025*
*Contract Version: 1.0.0*
*Deployment Status: ✅ Live on Core Testnet 2*

**Key Features:**
- Uses native Core Testnet tokens
- 85% to winner, 10% to platform, 5% to loser
- Secure fund transfers with reentrancy protection
- Owner-only settlement functions

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Compilation
```bash
npm run compile
```

### Testing
```bash
npm run test
```

### Local Deployment
```bash
# Start local Hardhat node (in separate terminal)
npm run node

# Deploy to local network
npm run deploy:localhost

# Interact with deployed contract
npm run interact:localhost
```

### Core Testnet Deployment

1. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your private key and platform address
```

2. **Deploy to Core Testnet:**
```bash
npm run deploy:core-testnet
```

3. **Verify contract:**
```bash
npm run verify:core-testnet
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```bash
# Private key for deploying contracts (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Platform address that will receive 10% of rewards
PLATFORM_ADDRESS=your_platform_wallet_address

# Core Testnet RPC URL
CORE_TESTNET_RPC=https://rpc.test.btcs.network
```

## 📊 Contract Interface

### Main Functions

#### `stakeForDuel(uint256 duelId) external payable`
- Allows users to stake tokens for a specific duel
- Can be called multiple times to accumulate stakes
- Emits `StakePlaced` event

#### `settleDuel(uint256 duelId, address winner, address loser) external onlyOwner`
- Settles a duel and distributes rewards
- Only callable by contract owner
- Distributes 85%/10%/5% split
- Emits `DuelSettled` event

#### `refundStake(uint256 duelId, address user) external onlyOwner`
- Refunds a user's stake for canceled duels
- Only callable by contract owner
- Emits `StakeRefunded` event

### View Functions

#### `getStake(uint256 duelId, address user) external view returns (uint256)`
- Returns the amount staked by a user for a specific duel

#### `getTotalDuelStakes(uint256 duelId, address user1, address user2) external view returns (uint256)`
- Returns total stakes for a duel between two users

## 🔐 Security Features

- **OpenZeppelin Contracts**: Uses audited contracts for `Ownable` and `ReentrancyGuard`
- **Access Control**: Only owner can settle duels and refund stakes
- **Reentrancy Protection**: All fund transfers are protected
- **Input Validation**: Comprehensive validation of addresses and amounts
- **Event Logging**: All important actions emit events for transparency

## 🌐 Networks

### Core Testnet
- **Chain ID**: 1115
- **RPC URL**: https://rpc.test.btcs.network
- **Explorer**: https://scan.test.btcs.network

### Local Development
- **Chain ID**: 31337 (Hardhat default)
- **RPC URL**: http://127.0.0.1:8545

## 📄 License

This project is licensed under the MIT License.
