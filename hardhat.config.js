require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Ripple EVM Sidechain Testnet
    rippleEVMTestnet: {
      url: "https://rpc-evm-sidechain.xrpl.org",
      chainId: 1440002,
      accounts: process.env.EVM_DEPLOYER_PRIVATE_KEY
        ? [process.env.EVM_DEPLOYER_PRIVATE_KEY]
        : (process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []),
      gasPrice: 30000000000, // 30 gwei
      gas: 3000000,
    },
    // Ripple EVM Sidechain Mainnet (for production)
    rippleEVMMainnet: {
      url: "https://rpc-evm-sidechain.xrpl.org",
      chainId: 1440001,
      accounts: process.env.EVM_DEPLOYER_PRIVATE_KEY
        ? [process.env.EVM_DEPLOYER_PRIVATE_KEY]
        : (process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []),
      gasPrice: 30000000000, // 30 gwei
      gas: 3000000,
    },
    // Local development
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      rippleEVMTestnet: "not-needed", // No API key needed for Ripple EVM
      rippleEVMMainnet: "not-needed",
    },
    customChains: [
      {
        network: "rippleEVMTestnet",
        chainId: 1440002,
        urls: {
          apiURL: "https://evm-sidechain.xrpl.org/api",
          browserURL: "https://evm-sidechain.xrpl.org",
        },
      },
      {
        network: "rippleEVMMainnet",
        chainId: 1440001,
        urls: {
          apiURL: "https://evm-sidechain.xrpl.org/api",
          browserURL: "https://evm-sidechain.xrpl.org",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
}; 