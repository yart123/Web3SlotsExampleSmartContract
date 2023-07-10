// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Web3Slots = await hre.ethers.getContractFactory("Web3Slots");
  const pricePerSpinWei = hre.ethers.utils.parseUnits("0.1", "ether");
  const houseCutPercent = 5;
  const initialPrizeWei = ethers.utils.parseUnits("1", "ether")
  const web3Slots = await Web3Slots.deploy(pricePerSpinWei, houseCutPercent, { value: initialPrizeWei });
  await web3Slots.deployed();

  console.log(`The contract deployed to ${web3Slots.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
