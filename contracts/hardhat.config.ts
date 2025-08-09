import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    core_testnet: {
      url: 'https://rpc.test.btcs.network',
      accounts: process.env.CORE_PRIVATE_KEY
        ? [process.env.CORE_PRIVATE_KEY]
        : process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
      chainId: 1115,
      gasPrice: 20000000000, // 20 gwei
    },
    core_testnet_2: {
      url: 'https://rpc.test2.btcs.network/',
      accounts: process.env.CORE_PRIVATE_KEY
        ? [process.env.CORE_PRIVATE_KEY]
        : process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
      chainId: 1114,
      gasPrice: 20000000000, // 20 gwei
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    holesky: {
      url:
        process.env.HOLESKY_RPC_URL ||
        'https://ethereum-holesky.publicnode.com',
      accounts: process.env.HOLESKY_PRIVATE_KEY
        ? [process.env.HOLESKY_PRIVATE_KEY]
        : process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
      chainId: 17000,
    },
  },
  etherscan: {
    apiKey: {
      core_testnet: 'your-core-scan-api-key',
      holesky: process.env.ETHERSCAN_API_KEY || '',
    },
    customChains: [
      {
        network: 'core_testnet',
        chainId: 1115,
        urls: {
          apiURL: 'https://api.test.btcs.network/api',
          browserURL: 'https://scan.test.btcs.network',
        },
      },
      {
        network: 'core_testnet_2',
        chainId: 1114,
        urls: {
          apiURL: 'https://api.test2.btcs.network/api',
          browserURL: 'https://scan.test2.btcs.network',
        },
      },
      {
        network: 'holesky',
        chainId: 17000,
        urls: {
          apiURL: 'https://api-holesky.etherscan.io/api',
          browserURL: 'https://holesky.etherscan.io',
        },
      },
    ],
  },
};

export default config;
