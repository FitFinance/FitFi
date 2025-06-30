# FitFi Contracts - Project Structure

## 📁 Directory Structure

```
contracts/
├── contracts/
│   └── DuelStaking.sol          # Main staking contract
├── test/
│   └── DuelStaking.ts           # Comprehensive test suite (23 tests)
├── scripts/
│   ├── deploy.ts                # Main deployment script
│   ├── deploy-core-testnet-2.js # Core Testnet 2 deployment
│   ├── interact.ts              # Contract interaction script
│   ├── verify.ts                # Contract verification script
│   └── testnet-verify.ts        # Testnet verification script
├── deployments/
│   ├── core_testnet-deployment.json     # Core Testnet deployment info
│   ├── core_testnet_2-deployment.json   # Core Testnet 2 deployment info
│   └── DuelStaking-ABI.json             # Contract ABI
├── hardhat.config.ts            # Hardhat configuration
├── package.json                 # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── .env.example                # Environment variables template
├── README.md                   # Main documentation
└── TEST.md                     # Testing documentation
```

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

### Deployment
```bash
# Deploy to Core Testnet
npm run deploy:core-testnet

# Deploy to Core Testnet 2
npm run deploy:core-testnet-2
```

### Verification
```bash
# Verify on Core Testnet
npm run verify:core-testnet

# Verify on Core Testnet 2
npm run verify:core-testnet-2
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm run test` | Run test suite |
| `npm run deploy:localhost` | Deploy to local Hardhat network |
| `npm run deploy:core-testnet` | Deploy to Core Testnet |
| `npm run deploy:core-testnet-2` | Deploy to Core Testnet 2 |
| `npm run verify:core-testnet` | Verify contract on Core Testnet |
| `npm run verify:core-testnet-2` | Verify contract on Core Testnet 2 |
| `npm run interact:localhost` | Interact with local deployment |
| `npm run interact:core-testnet` | Interact with Core Testnet deployment |
| `npm run node` | Start local Hardhat node |
| `npm run clean` | Clean build artifacts |

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and fill in your values:

```bash
# Core Blockchain RPC URLs
CORE_TESTNET_RPC_URL=https://rpc.test.btcs.network
CORE_TESTNET_2_RPC_URL=https://rpc-testnet.coredao.org

# Deployment wallet private key
PRIVATE_KEY=your_private_key_here

# Platform address for fee collection
PLATFORM_ADDRESS=your_platform_address_here

# Etherscan API key for verification (optional)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Networks Supported
- **Core Testnet (Chain ID: 1115)** - Legacy testnet
- **Core Testnet 2 (Chain ID: 1114)** - Primary development network
- **Localhost** - Local Hardhat development network

## 🏗️ Smart Contract Architecture

### DuelStaking.sol
The main contract implementing:
- **Staking**: Users stake tokens for fitness duels
- **Settlement**: Automated reward distribution (85% winner, 10% platform, 5% loser)
- **Refunds**: Emergency refund system for canceled duels
- **Security**: ReentrancyGuard and Ownable protections

### Key Features
- Gas optimized design (200 optimization runs)
- Comprehensive event logging
- Multi-user stake accumulation
- Platform fee automation
- Emergency functions for edge cases

## 📊 Deployment Status

### Live Deployments
| Network | Contract Address | Status | Platform Fees |
|---------|-----------------|--------|---------------|
| Core Testnet | `0x...` | ✅ Active | ✅ Verified |
| Core Testnet 2 | `0x...` | ✅ Active | ✅ Verified |

### Revenue Collected
- **Total Platform Fees**: 0.002 tCORE
- **Test Duels Completed**: 5+
- **Fee Accuracy**: 100% (10% exact)

## 🧪 Testing

### Test Coverage
- **Total Tests**: 23 passing tests
- **Coverage Areas**: Staking, Settlement, Refunds, Security
- **Networks Tested**: Local, Core Testnet, Core Testnet 2

Run tests with:
```bash
npm run test
```

See `TEST.md` for detailed testing documentation.

## 🤝 Integration

### Backend Integration
The smart contracts are ready for backend integration. See the ABI files in `/deployments/` for contract interaction.

### Frontend Integration
Use the provided deployment addresses and ABI for web3 integration in mobile/web applications.

## 🔐 Security

### Auditing Notes
- OpenZeppelin contracts used for security
- ReentrancyGuard implemented
- Owner-only settlement functions
- Comprehensive input validation

### Gas Optimization
- Current approach: ~24,000 gas per user
- Rejected two-phase commit: ~80,000 gas per user
- 3.3x more efficient than complex alternatives
