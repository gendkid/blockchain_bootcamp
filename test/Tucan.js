const {expect} = require('chai');
const {ethers} = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits( n.toString(), 'ether' )
}

describe("Tucan", async ()=> {
	let token,
		accounts,
		deployer

	beforeEach( async ()=> {
		const Token =await ethers.getContractFactory('Tucan')
		token = await Token.deploy('Tucan', 'TUCU', "1000000")

		accounts = await ethers.getSigners()
		deployer = accounts[0]
	})

	describe( 'Deployment', ()=> {
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

	describe('Token Transfers', ()=> {
		
	})
})	