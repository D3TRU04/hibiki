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
      url: process.env.RIPPLE_EVM_RPC_URL || "",
      accounts: process.env.EVM_DEPLOYER_PRIVATE_KEY
        ? [process.env.EVM_DEPLOYER_PRIVATE_KEY]
        : (process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []),
      gasPrice: 30000000000, // 30 gwei
      gas: 3000000,
    },
    // Ripple EVM Sidechain Mainnet (for production)
    rippleEVMMainnet: {
      url: process.env.RIPPLE_EVM_MAINNET_RPC_URL || "",
      accounts: process.env.EVM_DEPLOYER_PRIVATE_KEY
        ? [process.env.EVM_DEPLOYER_PRIVATE_KEY]
        : (process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []),
      gasPrice: 30000000000, // 30 gwei
      gas: 3000000,
    },
    // Local development
    hardhat: {
      // No chainId forcing here to avoid conflicts when forking
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
        chainId: 1449000,
        urls: {
          apiURL: "https://explorer.testnet.xrplevm.org/api",
          browserURL: "https://explorer.testnet.xrplevm.org",
        },
      },
      {
        network: "rippleEVMMainnet",
        chainId: 1440001,
        urls: {
          apiURL: "https://explorer.testnet.xrplevm.org/api",
          browserURL: "https://explorer.testnet.xrplevm.org",
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