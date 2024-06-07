const {expect} = require('chai');
const {ethers} = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits( n.toString(), 'ether' )
}

describe('Exchange', ()=> {
	let deployer,
		feeAccount,
		exchange,
		token1,
		token2,
		user2

	const feePercent = 10

	beforeEach(async ()=> {
		const Exchange = await ethers.getContractFactory('Exchange')
		const Token = await ethers.getContractFactory('Token')

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]
		user1 = accounts[2]
		user2 = accounts[3]

		exchange = await Exchange.deploy(feeAccount.address, feePercent)
		token1 = await Token.deploy('Tucan', 'TUCU', '1000000')
		token2 = await Token.deploy('Shmuck', 'SMH', '1000000')

		let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))
		await transaction.wait() 
	})

	describe('Deployment', ()=> {
		it('tracks feeAccount', async ()=> {
			expect( await exchange.feeAccount()).to.equal(feeAccount.address)
		})

		it('tracks feePercent', async ()=> {
			expect(await exchange.feePercent()).to.equal(feePercent)
		})
	})

	describe('Depositing tokens', ()=> {
		let transaction, result
		let amount = tokens(10)

		describe('Success', ()=> {

			beforeEach(async ()=> {

				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = await transaction.wait()

				transaction = await exchange.connect(user1).depositToken(token1.address, amount)
				result = await transaction.wait()
			})

			it('tracks token deposit', async ()=> {
				expect(await token1.balanceOf(exchange.address)).to.equal(amount)
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
			})

			it('emits deposit event', async ()=> {
				const event = result.events[1]
				expect(event.event).to.equal('Deposit')

				const args = event.args
				expect(args.token).to.equal(token1.address)
				expect(args.user).to.equal(user1.address)
				expect(args.amount).to.equal(amount)
				expect(args.balance).to.equal(amount)
			})
		})

		describe('Failure', ()=> {
			it('fails when tokens are not approved', async ()=> {
				await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
			})
		})
	})	

	describe('Withdrawing tokens', ()=> {
		let transaction, result
		let amount = tokens(10)

		describe('Success', ()=> {

			beforeEach(async ()=> {

				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = await transaction.wait()

				transaction = await exchange.connect(user1).depositToken(token1.address, amount)
				result = await transaction.wait()

				transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
				result = await transaction.wait()
			})

			it('withdraws tokens', async ()=> {
				expect(await token1.balanceOf(exchange.address)).to.equal(0)
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
			})

			it('emits withdraw event', async ()=> {
				const event = result.events[1]
				expect(event.event).to.equal('Withdraw')

				const args = event.args
				expect(args.token).to.equal(token1.address)
				expect(args.user).to.equal(user1.address)
				expect(args.amount).to.equal(amount)
				expect(args.balance).to.equal(0)
			})
		})

		describe('Failure', ()=> {
			it('fails when tokens are not approved', async ()=> {
				  await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
			})
		})	
	})

	describe('Checking balances', ()=> {
		let transaction, result
		let amount = tokens(1)

		beforeEach(async ()=> {

			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = await transaction.wait()

			transaction = await exchange.connect(user1).depositToken(token1.address, amount)
			result = await transaction.wait()
		})

		it('returns user balance', async ()=> {
			expect(await exchange.balanceOf(token1.address, user1.address))
		})
	})

	describe('Making Orders', ()=> {
		let transaction, result
		let amount = tokens(10)

		beforeEach(async ()=> {
			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = await transaction.wait()

			transaction = await exchange.connect(user1).depositToken(token1.address, amount)
			result = await transaction.wait()

			transaction = await exchange.connect(user1).makeOrder(token2.address, tokens(5), token1.address, tokens(5))
			result = await transaction.wait()
		})

		describe('Success', ()=> {
			it('tracks the newly created order', async ()=> {
				expect(await exchange.orderCount()).to.equal(1)
			})

			it('emits order event', async ()=> {
				const event = result.events[0]
				expect(event.event).to.equal('Order')

				const args = event.args
				expect(args.id).to.equal(1)
				expect(args.user).to.equal(user1.address)
				expect(args.tokenGet).to.equal(token2.address)
				expect(args.amountGet).to.equal(tokens(5))
				expect(args.tokenGive).to.equal(token1.address)
				expect(args.amountGive).to.equal(tokens(5))
				expect(args.timestamp).to.at.least(1)
			})
		})


		describe('Failure', ()=> {
			it('rejects order with no balance', async ()=> {
				expect(exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))).to.be.reverted
			})
		})
	})

	describe('Order Actions', ()=>{
		let transaction, result
		let amount = tokens(1)

		beforeEach(async ()=> {
			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = await transaction.wait()

			transaction = await exchange.connect(user1).depositToken(token1.address, amount)
			result = await transaction.wait()

			transaction = await exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))
			result = await transaction.wait()
		})

		describe('Cancelling orders', ()=> {
			beforeEach(async ()=> {
				transaction = await exchange.connect(user1).cancelOrder(1)
				result = await transaction.wait()
			})
			describe('Success', ()=> {
				it('updates cancelled orders', async ()=>{
					expect(await exchange.orderCancelled(1)).to.equal(true)
				})
			
				it('emits order event', async ()=> {
					const event = result.events[0]
					expect(event.event).to.equal('Cancel')
	
					const args = event.args
					expect(args.id).to.equal(1)
					expect(args.user).to.equal(user1.address)
					expect(args.tokenGet).to.equal(token2.address)
					expect(args.amountGet).to.equal(tokens(1))
					expect(args.tokenGive).to.equal(token1.address)
					expect(args.amountGive).to.equal(tokens(1))
					expect(args.timestamp).to.at.least(1)
				})
			})		

			describe('Failure', ()=> {
				it('rejects invalid order ids', async ()=> {
					const invalidOrderId = 2
					await expect(exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted
				})

				it('rejects unauthorized cancellation', async ()=> {
					await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted
				})
			})
		})
	})
})
