const config = require('../src/config.json')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
  // fetch accounts
  const accounts = await ethers.getSigners()

  const { chainId } = await ethers.provider.getNetwork()
  console.log('running on', chainId)

  // deploy tokens && exchange
  const Tucan = await ethers.getContractAt('Token',config[chainId].Tucan.address)
  console.log(`Tucan Deployed to: ${Tucan.address}`)

  const mETH = await ethers.getContractAt('Token',config[chainId].mETH.address)
  console.log(`mETH Deployed to: ${mETH.address}`)

  const mDAI = await ethers.getContractAt('Token',config[chainId].mDAI.address)
  console.log(`mDAI Deployed to: ${mDAI.address}`)

  const exchange = await ethers.getContractAt('Exchange',config[chainId].exchange.address)
  console.log(`exchange Deployed to ${exchange.address}`)

  //send tokens to user1
  const sender = await accounts[0]
  const reciever = accounts[1]
  let amount = tokens(10000)
  let transaction, result

  transaction = await Tucan.connect(sender).transfer(reciever.address, amount)
  result = transaction.wait()
  console.log(`transferred ${amount} tokens from ${sender.address} to ${reciever.address} \n`)

  //set up exhange users
  const user1 = accounts[0]
  const user2 = accounts[1]

  //user1 aprvs and depo's mETH
  transaction = await mETH.connect(user1).approve(exchange.address, amount)
  result = await transaction.wait()
  console.log(`Approved ${amount} mETH tokens from ${user1.address}`)

  transaction = await exchange.connect(user1).depositToken(mETH.address, amount)
  result = await transaction.wait()
  console.log(`Deposited ${amount} mETH tokens from ${user1.address}`)

  //user2 aprv's and depo's Tucan
  transaction = await Tucan.connect(user2).approve(exchange.address, amount)
  result = await transaction.wait()
  console.log(`Approved ${amount} Tucan tokens from ${user2.address}`)

  transaction = await exchange.connect(user2).depositToken(Tucan.address, amount)
  result = await transaction.wait()
  console.log(`Deposited ${amount} Tucan tokens from ${user2.address}`)

  //user1 makeOrder to cancel
  let orderId, event, args
  transaction = await exchange.connect(user1).makeOrder(Tucan.address, tokens(10), mETH.address, tokens(5))
  result = await transaction.wait()
  event = result.events[0]
 
  console.log(`Made order from ${user1.address}`)

  //User 1 cancels order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  // Seed Filled Order

  // // User 1 makes order
  transaction = await exchange.connect(user1).makeOrder(Tucan.address, tokens(100), mETH.address, tokens(10))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // // User 2 fills order
  orderId = await result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // // Wait 1 second
  await wait(1)

  // // User 1 makes another order
  transaction = await exchange.makeOrder(Tucan.address, tokens(50), mETH.address, tokens(15))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // // User 2 fills another order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // // Wait 1 second
  await wait(1)

  // // User 1 makes final order
  transaction = await exchange.connect(user1).makeOrder(Tucan.address, tokens(200), mETH.address, tokens(20))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // // User 2 fills final order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // // Wait 1 second
  await wait(1)

  // /////////////////////////////////////////////////////////////
  // // Seed Open Orders
  // //

  // // User 1 makes 10 orders
  for(let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user1).makeOrder(Tucan.address, tokens(10 * i), mETH.address, tokens(10))
    result = await transaction.wait()

    console.log(`Made order from ${user1.address}`)

  //   // Wait 1 second
    await wait(1)
  }

  // // User 2 makes 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user2).makeOrder(mETH.address, tokens(10), Tucan.address, tokens(10 * i))
    result = await transaction.wait()

    console.log(`Made order from ${user2.address}`)

  //   // Wait 1 second
    await wait(1)
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });