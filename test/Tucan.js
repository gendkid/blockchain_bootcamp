const {expect} = require('chai');
const {ethers} = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits( n.toString(), 'ether' )
}

describe('Tucan', ()=> {
	let token,
		accounts,
		deployer,
		reciever,
		exchange

	beforeEach( async ()=> {
		const Token =await ethers.getContractFactory('Tucan')
		token = await Token.deploy('Tucan', 'TUCU', "1000000")

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		reciever = accounts[1]
		exchange = accounts[2]
	})

	describe('Deployment', ()=> {
		const name = 'Tucan'
		const symbol = 'TUCU'
		const decimals = '18'
		const totalSupply = tokens('1000000')


		it('token has correct name', async ()=> {
			expect(await token.name()).to.equal(name)
			console.log('This token is named ' + await token.name())
		})

		it('token has correct symbol', async ()=> {
			expect(await token.symbol()).to.equal(symbol)
			console.log('The symbol for this token is ' + await token.symbol())
		})

		it('token has correct amount of decimals', async ()=> {
			expect(await token.decimals()).to.equal(decimals)
			console.log('token has this many decimals ' + await token.decimals())
		})

		it('token has correct total supply', async ()=> {
			expect(await token.totalSupply()).to.equal(totalSupply)
			console.log('the total supply of tokens is ' + await token.totalSupply())
		})

		it('assigns total supply to deployer adx', async ()=> {
			expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
			console.log('deployer address balance is ' + await token.balanceOf(deployer.address))
		})
	})

	describe('Token transfers', ()=> {
		let amount, 
			transaction, 
			result, 
			event, 
			args

		describe('Success', ()=> {

			beforeEach( async ()=> {
				amount = tokens(100)
				transaction = await token.connect(deployer).transfer(reciever.address,amount)
				result = await transaction.wait()
				event = result.events[0]
				args = event.args

			})

			it('tokens transfer from ad1 to ad2', async ()=> {
				expect(await token.balanceOf(deployer.address)).to.equal(tokens('999900'))
				expect(await token.balanceOf(reciever.address)).to.equal(amount)
			})

			it('emits tranfer event', async ()=> {
				expect(args.from).to.equal(deployer.address)
				expect(args.to).to.equal(reciever.address)
				expect(args.value).to.equal(amount)
				console.log('transfer event includes => from: ', args.from, 'to: ', args.to, args.value)
			})
		})

		describe('Failure', ()=> {
			it('rejects insufficient balances', async ()=> {
				const invalidAmount = tokens(10000000)
				await expect(token.connect(deployer).transfer(reciever.address, invalidAmount)).to.be.reverted
			})

			it('rejects invalid reciever adx', async ()=> {
				const invalidreciever = 0x0000000000000000
				await expect(token.connect(deployer).transfer(invalidreciever, amount)).to.be.reverted
			})
		})
	})

	describe('Approving Tokens', ()=> {
		let amount, 
		transaction, 
		result

		beforeEach(async ()=> {
			amount = tokens(100)
			transaction = await token.connect(deployer).approve(exchange.address, amount)
			result = await transaction.wait()
		})

		describe('Success', ()=> {
			it('allocates allowance for spending', async ()=> {
				expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
			})

			it('emits an apporval event', async ()=> {
				const event = await result.events[0]
				expect(event.event).to.equal('Approval')

				const args = event.args
				expect(args.owner).to.equal(deployer.address)
				expect(args.spender).to.equal(exchange.address)
				expect(args.value).to.equal(amount)
			})
		})

		describe('Failure', ()=> {
			it('rejects invalid Senders', async ()=> {
				await expect(token.connect(deployer).approve('0x000b', amount)).to.be.reverted
			})
		})
	})

	describe('Delegated Token Transfers', ()=> {
		let amount, 
			transaction, 
			result				

		beforeEach(async ()=> {
			amount = tokens(100)
			transaction = await token.connect(deployer).approve(exchange.address, amount)
			result = await transaction.wait()
		})	

		describe('Success', ()=> {
			beforeEach( async ()=> {
				transaction = await token.connect(exchange).transferFrom(deployer.address, reciever.address, amount)
				result = await transaction.wait()
				event = result.events[0]
				args = event.args
			})
			
			it('transfers token balances', async ()=> {
				expect(await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits("999900", "ether"))
				expect(await token.balanceOf(reciever.address)).to.be.equal(amount)
			})

			it('resets spending allowance', async ()=> {
				expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0)
			})

			it('emits transfer event', async ()=> {
				expect(event.event).to.equal('Transfer')
				expect(args.from).to.equal(deployer.address)
				expect(args.to).to.equal(reciever.address)
				expect(args.value).to.equal(amount)
				console.log('transfer event includes => from: ', args.from, 'to: ', args.to, args.value)
			})
		})

		describe('Failure', ()=> {
			const invalidAmount = tokens(10000000000)

			it('reverts invalid transaction', async ()=> {
				await expect(token.connect(exchange).transferFrom(deployer.address, reciever.address, invalidAmount)).to.be.reverted
		    })
		})
	})
})
