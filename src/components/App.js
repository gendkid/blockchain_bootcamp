import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';

import { 
  loadProvider, 
  loadNetwork, 
  loadAccount, 
  loadTokens,
  loadExchange
} from '../store/interactions';

function App() {
  const dispatch = useDispatch()

  // Connect to Blockchain
  const loadBlockchainData = async ()=> {


    // Connect to Network/ User information
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)
    await loadAccount(provider,dispatch)

    // Fetch token smart contracts
    const Tucan = config[chainId].Tucan
    const mETH = config[chainId].mETH
    await loadTokens(provider, [Tucan.address, mETH.address], dispatch)

    // Fetch exchange smart contract
    const exchange = config[chainId].exchange
    await loadExchange(provider, exchange.address, dispatch)
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