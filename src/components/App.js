import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';

import { 
  loadProvider, 
  loadNetwork, 
  loadAccount, 
  loadToken 
} from '../store/interactions';

function App() {
  const dispatch = useDispatch()

  // Connect to Blockchain
  const loadBlockchainData = async ()=> {
    const account = await loadAccount(dispatch)
    console.log(account)

    // Connect to Network/ User information
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)

    // Fetch token smart contracts
    await loadToken(provider, config[chainId].Tucan.address, dispatch)
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