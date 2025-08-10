const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying KleoNFT contract to Ripple EVM Sidechain...");

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
      console.log(`Using EIP-1559 fees → maxFeePerGas=${HIGH_MAX_FEE.toString()} wei, maxPriorityFeePerGas=${HIGH_PRIORITY_FEE.toString()} wei`);
    } else {
      const netGasPrice = feeData && feeData.gasPrice != null ? feeData.gasPrice : HIGH_LEGACY_GAS_PRICE;
      const bumped = (typeof netGasPrice === 'bigint') ? netGasPrice * 3n : HIGH_LEGACY_GAS_PRICE;
      overrides = {
        gasPrice: bumped,
        gasLimit: GAS_LIMIT,
      };
      console.log(`Using legacy gasPrice → gasPrice=${bumped.toString()} wei`);
    }
  } catch (e) {
    overrides = {
      gasPrice: HIGH_LEGACY_GAS_PRICE,
      gasLimit: GAS_LIMIT,
    };
    console.log(`Fee data unavailable, using fallback gasPrice=${HIGH_LEGACY_GAS_PRICE.toString()} wei`);
  }

  // Get the contract factory
  const KleoNFT = await ethers.getContractFactory("KleoNFT");
  
  // Deploy the contract with overrides
  const kleoNFT = await KleoNFT.deploy(overrides);
  
  // Wait for deployment (ethers v6)
  await kleoNFT.waitForDeployment();
  const contractAddress = await kleoNFT.getAddress();

  console.log("✅ KleoNFT deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🌐 Network: Ripple EVM Sidechain Testnet");
  console.log("🔗 Explorer: https://evm-sidechain.xrpl.org/");
  
  // Verify contract on explorer
  console.log("\n🔍 To verify on explorer:");
  console.log(`1. Go to: https://evm-sidechain.xrpl.org/`);
  console.log(`2. Search for: ${contractAddress}`);
  console.log(`3. Click 'Verify Contract'`);
  console.log(`4. Use compiler version: 0.8.19`);
  console.log(`5. Use optimization: 200 runs`);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: "Ripple EVM Sidechain Testnet",
    deployer: await kleoNFT.runner.getAddress(),
    deploymentTime: new Date().toISOString(),
    contractName: "KleoNFT",
    compilerVersion: "0.8.19"
  };
  
  console.log("\n📋 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Test basic functions
  console.log("\n🧪 Testing contract functions...");
  
  try {
    const mintFee = await kleoNFT.getMintFee();
    const maxMints = await kleoNFT.getMaxMintsPerUser();
    const cooldown = await kleoNFT.getMintCooldown();
    
    console.log("✅ Contract functions working:");
    console.log(`   Mint Fee: ${ethers.formatEther(mintFee)} XRP`);
    console.log(`   Max Mints: ${maxMints.toString()}`);
    console.log(`   Cooldown: ${cooldown.toString()} seconds`);
    
  } catch (error) {
    console.log("❌ Error testing contract functions:", error.message);
  }
  
  console.log("\n🎉 Deployment complete! Add this to your .env.local:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 