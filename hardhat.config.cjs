require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: false
            },
            evmVersion: "shanghai"
        }
    },
    networks: {
        somniaTestnet: {
            url: "https://api.infra.testnet.somnia.network/",
            chainId: 50312,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
    },
    etherscan: {
        apiKey: {
            somniaTestnet: "any-string-works-for-blockscout",
        },
        customChains: [
            {
                network: "somniaTestnet",
                chainId: 50312,
                urls: {
                    apiURL: "https://shannon-explorer.somnia.network/api",
                    browserURL: "https://shannon-explorer.somnia.network",
                },
            },
        ],
    },
    paths: {
        sources: "./src/contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};
