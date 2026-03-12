import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("Please set PRIVATE_KEY in your .env file");
        process.exit(1);
    }

    const rpcUrl = "https://api.infra.testnet.somnia.network";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Deploying SomniaGovernance to Somnia Testnet...");
    console.log("Deployer address:", wallet.address);

    const artifactPath = path.resolve("./artifacts/src/contracts/SomniaGovernance.sol/SomniaGovernance.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

    // Somnia gas model: use a higher gas limit for deployment if needed, 
    // but ethers usually estimates well.
    const governance = await factory.deploy({
        gasLimit: 10000000, // Increased gas limit for deployment
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
        maxFeePerGas: ethers.parseUnits('2', 'gwei')
    });

    await governance.waitForDeployment();
    const address = await governance.getAddress();

    console.log("SomniaGovernance deployed to:", address);

    // Save the address to a file for the frontend to use
    const addressesPath = path.resolve("./src/contracts/addresses.json");
    const addresses = {
        SomniaGovernance: address,
        network: "Somnia Testnet",
        chainId: 50312
    };
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("Contract address saved to src/contracts/addresses.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
