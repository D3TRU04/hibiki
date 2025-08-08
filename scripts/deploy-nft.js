const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying KleoNFT contract to Ripple EVM Sidechain...");

  // Get the contract factory
  const KleoNFT = await ethers.getContractFactory("KleoNFT");
  
  // Deploy the contract
  const kleoNFT = await KleoNFT.deploy();
  
  // Wait for deployment
  await kleoNFT.deployed();

  console.log("✅ KleoNFT deployed successfully!");
  console.log("📍 Contract address:", kleoNFT.address);
  console.log("🌐 Network: Ripple EVM Sidechain Testnet");
  console.log("🔗 Explorer: https://evm-sidechain.xrpl.org/");
  
  // Verify contract on explorer
  console.log("\n🔍 To verify on explorer:");
  console.log(`1. Go to: https://evm-sidechain.xrpl.org/`);
  console.log(`2. Search for: ${kleoNFT.address}`);
  console.log(`3. Click 'Verify Contract'`);
  console.log(`4. Use compiler version: 0.8.19`);
  console.log(`5. Use optimization: 200 runs`);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: kleoNFT.address,
    network: "Ripple EVM Sidechain Testnet",
    chainId: 1440002,
    deployer: await kleoNFT.signer.getAddress(),
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
    console.log(`   Mint Fee: ${ethers.utils.formatEther(mintFee)} XRP`);
    console.log(`   Max Mints: ${maxMints.toString()}`);
    console.log(`   Cooldown: ${cooldown.toString()} seconds`);
    
  } catch (error) {
    console.log("❌ Error testing contract functions:", error.message);
  }
  
  console.log("\n🎉 Deployment complete! Add this to your .env.local:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${kleoNFT.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 