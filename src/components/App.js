
import '../App.css';
import { useEffect } from 'react';
import { ethers } from 'ethers';
import config from '../config.json'
import TOKEN_ABI from '../abis/Token.json'


function App() {

  // Connect wallet to app
  const loadBlockchainData = async ()=> {
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
    console.log(accounts[0])

    // Connect ethers to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const {chainId} = await provider.getNetwork()
    console.log(chainId)

    // Fetch token smart contracts
    const token = new ethers.Contract(config[chainId].Tucan.address ,TOKEN_ABI , provider)
    console.log(await token.name())
    console.log(await token.symbol())
    console.log(await token.address)
  
    // const token = new ethers.Contract()
    // const token = new ethers.Contract()

  }


  useEffect(()=> {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;