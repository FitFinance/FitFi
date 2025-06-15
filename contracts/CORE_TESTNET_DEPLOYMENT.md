# Core Testnet Deployment Guide

## Prerequisites

### 1. Get Core Testnet Tokens
- Visit Core Testnet Faucet: https://scan.test.btcs.network/faucet
- Connect your wallet and request test tokens
- You'll need CORE tokens for gas fees

### 2. Setup Wallet
```bash
# Generate a new wallet for testnet (recommended)
# OR use your existing wallet private key

# Update .env file with real credentials:
PRIVATE_KEY=your_actual_private_key_without_0x
PLATFORM_ADDRESS=your_platform_wallet_address
```

### 3. Deploy to Core Testnet
```bash
cd /home/cbof/fitfi/contracts

# Deploy to Core Testnet
npm run deploy:core-testnet

# Verify contract (optional)
npm run verify:core-testnet
```

### 4. Update Backend Configuration
After successful deployment, update backend with new contract address:
```bash
# Copy testnet deployment info to backend
cp deployments/core_testnet-deployment.json ../backend/contracts/
```

## Security Notes
- Never use mainnet private keys for testnet
- Keep testnet and mainnet environments separate
- Test thoroughly before mainnet deployment
