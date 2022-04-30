const { network } =require("hardhat")

module.exports.moveTime= async function (amount) {
  console.log("Moving blocks...")
  await network.provider.send("evm_increaseTime", [amount])

  console.log(`Moved forward in time ${amount} seconds`)
}