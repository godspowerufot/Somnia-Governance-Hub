import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    paths: {
        sources: "./src/contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};

export default config;
