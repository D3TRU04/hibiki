const { ethers } = require("hardhat");

async function main() {
  // Deploying KleoNFT contract to Ripple EVM Sidechain...

  // Prepare fee overrides to satisfy minimum network fee
  const provider = ethers.provider;
  let overrides = {};
  const GWEI = 1_000_000_000n;
  const HIGH_MAX_FEE = 700n * GWEI; // 700 gwei
  const HIGH_PRIORITY_FEE = 10n * GWEI; // 10 gwei
  const HIGH_LEGACY_GAS_PRICE = 700n * GWEI; // 700 gwei
  const GAS_LIMIT = 3_500_000n;

  try {
    const feeData = await provider.getFeeData();
    const hasEip1559 = feeData && feeData.maxFeePerGas != null && feeData.maxPriorityFeePerGas != null;
    if (hasEip1559) {
      overrides = {
        maxFeePerGas: HIGH_MAX_FEE,
        maxPriorityFeePerGas: HIGH_PRIORITY_FEE,
        gasLimit: GAS_LIMIT,
      };
      // Using EIP-1559 fees
    } else {
      const netGasPrice = feeData && feeData.gasPrice != null ? feeData.gasPrice : HIGH_LEGACY_GAS_PRICE;
      const bumped = (typeof netGasPrice === 'bigint') ? netGasPrice * 3n : HIGH_LEGACY_GAS_PRICE;
      overrides = {
        gasPrice: bumped,
        gasLimit: GAS_LIMIT,
      };
      // Using legacy gasPrice
    }
  } catch (e) {
    overrides = {
      gasPrice: HIGH_LEGACY_GAS_PRICE,
      gasLimit: GAS_LIMIT,
    };
    // Fee data unavailable, using fallback gasPrice
  }

  // Get the contract factory
  const KleoNFT = await ethers.getContractFactory("KleoNFT");
  
  // Deploy the contract with overrides
  const kleoNFT = await KleoNFT.deploy(overrides);
  
  // Wait for deployment (ethers v6)
  await kleoNFT.waitForDeployment();
  const contractAddress = await kleoNFT.getAddress();

  // KleoNFT deployed successfully
  // Contract address: ${contractAddress}
  // Network: Ripple EVM Sidechain Testnet
  // Explorer: https://evm-sidechain.xrpl.org/
  
  // To verify on explorer:
  // 1. Go to: https://evm-sidechain.xrpl.org/
  // 2. Search for: ${contractAddress}
  // 3. Click 'Verify Contract'
  // 4. Use compiler version: 0.8.19
  // 5. Use optimization: 200 runs
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: "Ripple EVM Sidechain Testnet",
    deployer: await kleoNFT.runner.getAddress(),
    deploymentTime: new Date().toISOString(),
    contractName: "KleoNFT",
    compilerVersion: "0.8.19"
  };
  
  // Deployment Info saved
  
  // Testing contract functions...
  
  try {
    const mintFee = await kleoNFT.getMintFee();
    const maxMints = await kleoNFT.getMaxMintsPerUser();
    const cooldown = await kleoNFT.getMintCooldown();
    
    // Contract functions working:
    // Mint Fee: ${ethers.formatEther(mintFee)} XRP
    // Max Mints: ${maxMints.toString()}
    // Cooldown: ${cooldown.toString()} seconds
    
  } catch (error) {
    // Error testing contract functions: ${error.message}
  }
  
  // Deployment complete! Add this to your .env.local:
  // NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${contractAddress}
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // Deployment failed: ${error}
    process.exit(1);
  }); 