# FitFi Backend Documentation

Welcome to the **FitFi Backend**! This guide provides all the necessary steps and information to set up and work with the backend effectively.

---

## Getting Started

To begin, ensure you have the required global dependencies installed. These tools are essential for development, linting, and documentation generation.

---

## Installation Steps

### Install Global Dependencies

Run the following command to install all required global dependencies:

```bash
npm run preinstall
```

#### What is `preinstall`?

The `preinstall` script, defined in the `package.json` file, ensures that all necessary tools are installed globally before proceeding with the main project setup. This step is crucial for maintaining a consistent development environment.

Here is the relevant snippet from `package.json`:

```json
{
  "scripts": {
    "preinstall": "npm i docsify-cli -g && npm i nodemon -g && npm i concurrently -g && npm i eslint -g && npm i prettier -g"
  }
}
```

---

### List of Global Dependencies

Below is a list of the global dependencies installed by the `preinstall` script, along with their purposes:

- **`prettier`**: A code formatter to ensure consistent code style.
- **`eslint`**: A linter for identifying and fixing problems in JavaScript and TypeScript code.
- **`docsify-cli`**: A tool for generating and managing project documentation.
- **`nodemon`**: A utility that automatically restarts the server when file changes are detected during development.
- **`concurrently`**: A tool for running multiple commands simultaneously in a single terminal.

---

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd fitfi/backend
```

### 2. Install Dependencies
```bash
npm run preinstall  # Install global dependencies
npm install         # Install project dependencies
```

### 3. Environment Configuration
Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Edit the `.env` file with your actual configuration values:

#### Required Environment Variables:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `REDIS_URL`: Redis connection string
- `BLOCKCHAIN_RPC_URL`: Core Testnet RPC URL
- `DUEL_STAKING_CONTRACT_ADDRESS`: Deployed contract address
- `PLATFORM_ADDRESS`: Platform wallet address
- `PLATFORM_PRIVATE_KEY`: Platform wallet private key (keep secure!)

### 4. Database Setup
Start MongoDB and Redis using Docker:
```bash
docker-compose up -d
```

### 5. Start the Development Server
```bash
npm run dev
```

## Blockchain Integration

FitFi integrates with the Core Testnet 2 blockchain for decentralized fitness dueling:

### Features:
- **Smart Contract Staking**: Users stake tCORE2 tokens for duels
- **Automated Settlements**: Winners receive 85% of the total stake
- **Platform Fees**: 10% platform fee, 5% goes to a community pool
- **Real-time Updates**: WebSocket events for blockchain transactions

### Contract Details:
- **Network**: Core Testnet 2 (Chain ID: 1114)
- **Contract Address**: `0x8796071429e599a1ec631258dF4aEceA18cB9F69`
- **RPC URL**: `https://rpc.test2.btcs.network`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with wallet signature
- `POST /api/auth/register` - User registration

### Duels
- `POST /api/duels/search-opponent` - Find and create blockchain duel
- `POST /api/duels/stake-duel` - Record blockchain stake transaction
- `PUT /api/duels/:id` - Update duel status and trigger settlement

### WebSocket Events
- `match_found_start_staking` - Opponent found, start staking
- `user_staked` - User completed blockchain stake
- `duel_active` - Both users staked, duel active
- `duel_settled` - Duel completed and settled

## Development Scripts

### Available Scripts:
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run docs` - Start documentation server

### Utility Scripts:
- `scripts/create-admin-account.ts` - Create admin user account
- `scripts/dummy-wallet.ts` - Test wallet utilities

## Security Notes

⚠️ **Important Security Considerations:**

1. Never commit `.env` files to version control
2. Keep private keys secure and never hardcode them
3. Use environment variables for all sensitive configuration
4. Regularly rotate JWT secrets and API keys
5. Monitor blockchain transactions for suspicious activity

## Database Schema

### Users Collection:
```typescript
interface IUser {
  walletAddress: string;
  username: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Duels Collection:
```typescript
interface IDuels {
  user1: ObjectId;
  user2: ObjectId;
  status: 'pending' | 'active' | 'completed';
  blockchainDuelId?: number;
  stakeAmount: string;
  user1StakeStatus: 'pending' | 'staked' | 'failed';
  user2StakeStatus: 'pending' | 'staked' | 'failed';
  stakingDeadline: Date;
  user1TxHash?: string;
  user2TxHash?: string;
  settlementTxHash?: string;
  isBlockchainActive: boolean;
  winner?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## Additional Information

### Why Use Global Dependencies?

Global dependencies are tools that are installed system-wide and can be accessed from any project. They help streamline the development process by providing consistent functionality across different environments.

### How to Verify Installation?

After running the `preinstall` command, you can verify the installation of each dependency by running the following commands:

```bash
prettier --version
eslint --version
docsify --version
nodemon --version
concurrently --version
```

If all commands return version numbers, the dependencies are installed correctly.

---

## Running the Backend

Before starting any method, ensure you have created a `.env` file in the root directory of the backend. The `.env` file should contain the necessary environment variables (content to be added as required).

### Development Mode

To start the backend in development mode, use the following command:

```bash
npm run dev
```

#### What Happens in Development Mode?

- **TypeScript Compiler (`tsc --watch`)**: Watches for changes in TypeScript files and compiles them to JavaScript in real-time.
- **Nodemon**: Automatically restarts the server whenever changes are detected in the compiled JavaScript files.
- **Concurrently**: Runs both the TypeScript compiler and the server watcher simultaneously.

This setup ensures a smooth development experience by automating repetitive tasks.

### Production Mode

To start the backend in production mode, use the following commands:

1. Build the project:

```bash
npm run build
```

This compiles the TypeScript files into JavaScript and places them in the `dist` directory.

2. Start the server:

```bash
npm start
```

#### What Happens in Production Mode?

- The `build` script compiles the TypeScript code into optimized JavaScript files.
- The `start` script runs the compiled server file (`dist/server.js`) using Node.js.

This setup is optimized for running the backend in a production environment.

---

## Troubleshooting Development Commands

If the development commands fail for any reason, you can manually run the required processes in separate terminals. This ensures that both the TypeScript compiler and the server watcher are running correctly.

### Steps to Resolve

1. Open two terminal windows.

2. In the first terminal, run the TypeScript compiler in watch mode:

```bash
tsx --watch
```

3. In the second terminal, start the server using `nodemon`:

```bash
nodemon dist/server.js
```

By running these commands in separate terminals, you can ensure that the development environment functions as expected, even if the `npm run dev` command fails.

---
