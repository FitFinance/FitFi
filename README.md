# FitFi

FitFi is a comprehensive blockchain-based fitness platform that gamifies exercise through competitive fitness duels. Users stake cryptocurrency, compete in real-time fitness challenges, and earn rewards based on their performance. The platform integrates smart contracts, a robust backend API, and a mobile application with Health Connect integration.

## Contract Address

Following is the contract address for FitFi:
[0x8796071429e599a1ec631258dF4aEceA18cB9F69](https://scan.test2.btcs.network/address/0x8796071429e599a1ec631258dF4aEceA18cB9F69)

A transaction made over this contract can be viewed [here](https://scan.test2.btcs.network/tx/0xbd6927d7996f3363bfddfb0bf30120269055edfcc02bcf8f9f8d4a2771afb6e6).

## 🏗️ Project Architecture

```
FitFi/
├── contracts/              # Smart contracts (Solidity)
├── backend/               # Node.js/Express API server
├── fitfi-app/            # Native Android app (Kotlin/Compose)
└── fitfi-mobile-app/     # React Native/Expo mobile app
```

## 📋 Table of Contents

- [Smart Contracts](#-smart-contracts)
- [Backend API](#-backend-api)
- [Mobile Applications](#-mobile-applications)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Contract Integration](#-contract-integration)
- [Security Features](#-security-features)

---

## 🔗 Smart Contracts

### Contract Address

**FitFi DuelStaking Contract**: [`0x8796071429e599a1ec631258dF4aEceA18cB9F69`](https://scan.test2.btcs.network/address/0x8796071429e599a1ec631258dF4aEceA18cB9F69)

### Core Contract: DuelStaking.sol

The main smart contract implements a **Direct Commit Pattern** for efficient gas usage and simple user experience.

#### Key Functions

```solidity

function stakeForDuel(uint256 duelId) external payable


function settleDuel(uint256 duelId, address winner, address loser) external onlyOwner


function refundStake(uint256 duelId, address user) external onlyOwner


function getStake(uint256 duelId, address user) external view returns (uint256)
function getTotalDuelStakes(uint256 duelId, address user1, address user2) external view returns (uint256)
```

#### Reward Distribution

- **Winner**: 85% of total stakes
- **Platform**: 10% of total stakes
- **Loser**: 5% of total stakes (participation reward)

#### Contract Events

```solidity
event StakePlaced(uint256 indexed duelId, address indexed user, uint256 amount);
event DuelSettled(uint256 indexed duelId, address winner, address loser, uint256 winnerShare, uint256 platformShare, uint256 loserShare);
event StakeRefunded(uint256 indexed duelId, address indexed user, uint256 amount);
event PlatformAddressUpdated(address oldAddress, address newAddress);
```

### Network Support

#### Core Testnet 2 (Current)

```
Network Name: Core Testnet 2
RPC URL: https://rpc.test2.btcs.network/
Chain ID: 1114
Currency: tCORE2
Explorer: https://scan.test2.btcs.network
Faucet: https://scan.test2.btcs.network/faucet
```

#### Holesky (Ethereum Testnet)

```
Network Name: Holesky
RPC URL: https://ethereum-holesky-rpc.publicnode.com
Chain ID: 17000
Currency: ETH
Explorer: https://holesky.etherscan.io
```

### Contract Security

- **OpenZeppelin Integration**: Uses `ReentrancyGuard` and `Ownable`
- **Access Control**: Owner-only settlement and refund functions
- **Input Validation**: Comprehensive address and amount validation
- **Gas Optimization**: ~24,000 gas per stake (3.3x more efficient than alternatives)

---

## 🚀 Backend API

### Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for real-time features
- **WebSockets**: Socket.IO for real-time updates
- **Blockchain**: Ethers.js for smart contract interaction

### Core Services

#### DuelStakingService

Handles all blockchain interactions with the smart contract:

```typescript
class DuelStakingService {
  async stakeForDuel(
    duelId: number,
    stakeAmount: string,
    privateKey: string
  ): Promise<string>;

  async settleDuel(
    duelId: number,
    winnerAddress: string,
    loserAddress: string,
    privateKey: string
  ): Promise<string>;

  async refundStake(
    duelId: number,
    userAddress: string,
    privateKey: string
  ): Promise<string>;

  async getStake(duelId: number, userAddress: string): Promise<bigint>;
  async getTotalDuelStakes(
    duelId: number,
    user1: string,
    user2: string
  ): Promise<bigint>;
}
```

### API Routes

#### Authentication Routes (`/api/v1/auth/`)

```typescript
POST / register;
POST / login;
POST / wallet - auth;
POST / wallet - get - message;
POST / get - profile;
POST / update - profile;
POST / request - otp;
POST / verify - otp;
```

#### Duel Management Routes (`/api/v1/duels/`)

```typescript
POST / search - opponent;
POST / stake - duel;
POST / update - duel;
GET / active - duels;
GET / active;
```

#### Health Data Routes (`/api/v1/health-data/`)

```typescript
POST /submit
GET  /duel/:duelId
POST /start-monitoring
```

#### Challenge Routes (`/api/v1/challenges/`)

```typescript
GET  /
POST /
```

#### Test Routes (`/api/v1/test/`)

```typescript
GET / health - check;
GET / network - diagnostics;
```

### Real-time Features (WebSocket Events)

```typescript
'match_found_start_staking';
'user_staked';
'duel_active';
'staking_timeout';

'health_monitoring_started';
'health_data_received';
'duel_completed';
'duel_settled';
```

### Database Schema

#### Users Collection

```typescript
interface IUser {
  walletAddress: string;
  username: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Duels Collection

```typescript
interface IDuels {
  user1: ObjectId;
  user2: ObjectId;
  status: 'pending' | 'active' | 'monitoring_health' | 'completed';
  blockchainDuelId?: number;
  stakeAmount: string;
  user1StakeStatus: 'pending' | 'staked' | 'failed';
  user2StakeStatus: 'pending' | 'staked' | 'failed';
  stakingDeadline: Date;
  user1TxHash?: string;
  user2TxHash?: string;
  settlementTxHash?: string;
  winner?: ObjectId;
  duelStartTime?: Date;
  duelEndTime?: Date;
  duelDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Health Data Collection

```typescript
interface IHealthData {
  user: ObjectId;
  duel: ObjectId;
  dataType: 'steps' | 'calories' | 'distance' | 'active_time';
  value: number;
  timestamp: Date;
  source: 'health_connect' | 'manual' | 'mock';
  isValidated: boolean;
}
```

#### Challenges Collection

```typescript
interface IChallenge {
  name: string;
  description: string;
  unit: 'steps' | 'calories' | 'distance' | 'active_time';
  target: number;
  duration: number;
  isActive: boolean;
  createdAt: Date;
}
```

### Environment Configuration

```bash
# Database
MONGO_URI=mongodb://localhost:27017/fitfi
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-secure-jwt-secret
JWT_TTL=7d

# Blockchain
BLOCKCHAIN_RPC_URL=https://rpc.test2.btcs.network/
DUEL_STAKING_CONTRACT_ADDRESS=0x8796071429e599a1ec631258dF4aEceA18cB9F69
PLATFORM_ADDRESS=0xYourPlatformAddress
PLATFORM_PRIVATE_KEY=your-private-key

# OTP Authentication (Mobile)
ETH_RPC_URL=https://rpc.test2.btcs.network/
SIGNUP_CONTRACT_ADDRESS=0xYourSignupContractAddress
ADMIN_PRIVATE_KEY=your-admin-private-key
OTP_TTL_SECONDS=300

# Server
PORT=3000
NODE_ENV=development
```

---

## 📱 Mobile Applications

### React Native/Expo App (Primary)

Located in [`fitfi-mobile-app/`](fitfi-mobile-app/)

**Features:**

- Cross-platform (iOS/Android) support
- Health Connect integration for fitness tracking
- Real-time WebSocket connections
- Wallet integration with MetaMask
- Push notifications
- Offline capability

**Key Technologies:**

- React Native with Expo
- TypeScript
- Expo Health Connect for fitness data
- Socket.IO for real-time updates
- AsyncStorage for local data

### Native Android App (Alternative)

Located in [`fitfi-app/`](fitfi-app/)

**Features:**

- Pure Kotlin/Jetpack Compose implementation
- Native Android Health Connect integration
- Material Design 3
- MVVM Architecture
- DataStore for preferences

**Technologies:**

- Kotlin
- Jetpack Compose
- Retrofit for API calls
- Hilt for dependency injection
- Navigation Compose

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- Redis
- Android Studio (for mobile development)
- MetaMask or compatible wallet

### Backend Setup

1. **Clone and navigate to backend**

   ```bash
   git clone <repository-url>
   cd FitFi/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start services**

   ```bash
   # Start MongoDB and Redis
   docker-compose up -d

   # Development mode
   npm run dev

   # Production mode
   npm run build && npm start
   ```

### Contract Deployment

1. **Navigate to contracts directory**

   ```bash
   cd contracts
   npm install
   ```

2. **Configure network**

   ```bash
   # Set up .env file with RPC URL and private key
   cp .env.example .env
   ```

3. **Deploy to Core Testnet 2**

   ```bash
   npm run deploy:core-testnet-2
   ```

4. **Verify deployment**
   ```bash
   npm run test:live
   ```

### Mobile App Setup

1. **Navigate to mobile app**

   ```bash
   cd fitfi-mobile-app
   npm install
   ```

2. **Start development server**

   ```bash
   npx expo start
   ```

3. **Build for production**

   ```bash
   # Install EAS CLI
   npm install -g eas-cli

   # Build APK
   eas build --profile preview --platform android
   ```

---

## 📚 API Documentation

### Authentication Flow

1. **Wallet Authentication** (Recommended)

   ```typescript

   POST /api/v1/auth/wallet-get-message
   Body: { walletAddress: "0x..." }



   POST /api/v1/auth/wallet-auth
   Body: { walletAddress: "0x...", signature: "0x..." }
   ```

2. **OTP Authentication** (Mobile)

   ```typescript

   POST /api/v1/auth/request-otp
   Body: { walletAddress: "0x..." }


   POST /api/v1/auth/verify-otp
   Body: { walletAddress: "0x...", otp: "123456" }
   ```

### Duel Lifecycle

1. **Find Opponent**

   ```typescript
   POST / api / v1 / duels / search - opponent;
   Headers: {
     Authorization: 'Bearer <jwt>';
   }
   Body: {
     challengeId: 'challenge_id';
   }
   ```

2. **Stake for Duel**

   ```typescript
   POST /api/v1/duels/stake-duel
   Body: { duelId: "duel_id", txHash: "0x...", amount: "1000000000000000000" }
   ```

3. **Start Health Monitoring**

   ```typescript
   POST /api/v1/health-data/start-monitoring
   Body: { duelId: "duel_id", durationMinutes: 60 }
   ```

4. **Submit Fitness Data**
   ```typescript
   POST /api/v1/health-data/submit
   Body: {
     duelId: "duel_id",
     dataType: "steps",
     value: 1500,
     timestamp: "2024-01-01T10:00:00Z"
   }
   ```

---

## 🔧 Contract Integration

### Backend Integration Example

```javascript
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://rpc.test2.btcs.network/');
const contract = new ethers.Contract(contractAddress, ABI, provider);

contract.on('StakePlaced', (duelId, user, amount) => {
  console.log(
    `User ${user} staked ${ethers.formatEther(amount)} for duel ${duelId}`
  );

  updateDuelStakeStatus(duelId, user, 'staked');
});

async function settleDuel(duelId, winnerAddress, loserAddress) {
  const wallet = new ethers.Wallet(privateKey, provider);
  const contractWithSigner = contract.connect(wallet);

  const tx = await contractWithSigner.settleDuel(
    duelId,
    winnerAddress,
    loserAddress
  );
  await tx.wait();

  return tx.hash;
}
```

### Frontend Integration Example

```javascript
import { ethers } from 'ethers';

const connectWallet = async () => {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, ABI, signer);
    return contract;
  }
};

const stakeForDuel = async (duelId, stakeAmount) => {
  const contract = await connectWallet();
  const tx = await contract.stakeForDuel(duelId, {
    value: ethers.parseEther(stakeAmount),
  });
  return tx.hash;
};
```

---

## 🔐 Security Features

### Smart Contract Security

- **OpenZeppelin Contracts**: Audited `Ownable` and `ReentrancyGuard`
- **Access Control**: Owner-only settlement and refund functions
- **Input Validation**: Comprehensive validation of addresses and amounts
- **Reentrancy Protection**: All fund transfers protected
- **Event Logging**: Complete audit trail for transparency

### Backend Security

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API endpoint protection against abuse
- **Input Sanitization**: MongoDB injection prevention
- **CORS Protection**: Cross-origin request security
- **Helmet**: Security headers for Express.js
- **Environment Variables**: Secure configuration management

### Mobile Security

- **Biometric Authentication**: Device-level security
- **Secure Storage**: Encrypted local data storage
- **Certificate Pinning**: API communication security
- **Health Data Privacy**: Temporary storage, automatic cleanup
- **Wallet Security**: MetaMask integration with hardware wallet support

---

## 🌐 Network Information

### Supported Networks

| Network        | Chain ID | RPC URL                                     | Explorer                        |
| -------------- | -------- | ------------------------------------------- | ------------------------------- |
| Core Testnet 2 | 1114     | https://rpc.test2.btcs.network/             | https://scan.test2.btcs.network |
| Holesky        | 17000    | https://ethereum-holesky-rpc.publicnode.com | https://holesky.etherscan.io    |
| Localhost      | 31337    | http://127.0.0.1:8545                       | -                               |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For technical support and questions:

- **Issues**: [GitHub Issues](https://github.com/FitFinance/FitFi/issues)
- **Documentation**: Check the `/docs` folder in each module
- **Contract Explorer**: [View on Core Testnet 2](https://scan.test2.btcs.network/address/0x8796071429e599a1ec631258dF4aEceA18cB9F69)

---

**FitFi** - Move to Earn, Win by Fitness! 🏃‍♂️💎
