const {expect} = require('chai');
const {ethers} = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits( n.toString(), 'ether' )
}

describe('Tucan', async ()=> {
	let token,
		accounts,
		deployer,
		reciever

	beforeEach( async ()=> {
		const Token =await ethers.getContractFactory('Tucan')
		token = await Token.deploy('Tucan', 'TUCU', "1000000")

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		reciever = accounts[1]
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
		let amount, transaction, result, event, args

		describe('Success', ()=> {
			beforeEach( async ()=> {
				amount = tokens(100)
				transaction = await token.connect(deployer).transfer(reciever.address,amount)
				result = await transaction.wait()
				event = result.events[0]
				args = event.args

			})

			it('tokens transfer from ad1 to ad2', async ()=> {
				console.log('deployer balance before txn', await token.balanceOf(deployer.address))
				console.log('reciever balance before txn', await token.balanceOf(reciever.address))


				expect(await token.balanceOf(deployer.address)).to.equal(tokens('999900'))
				expect(await token.balanceOf(reciever.address)).to.equal(amount)

				console.log('deployer balance before txn', await token.balanceOf(deployer.address))
				console.log('reciever balance before txn', await token.balanceOf(reciever.address))
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

				it('rejects insufficient balances', async ()=> {
				const invalidreciever = 0x0000000000000000
				await expect(token.connect(deployer).transfer(invalidreciever, amount)).to.be.reverted
			})
		})

	})
})	