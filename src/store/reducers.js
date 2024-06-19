export const provider = (state = {}, action) => {
  switch (action.type) {
    case 'PROVIDER_LOADED':
      return {
        ...state,
        connection: action.connection
      }
    case 'NETWORK_LOADED':
      return {
        ...state,
        chainId: action.chainId
      }
    case 'ACCOUNT_LOADED':
      return {
        ...state,
        account: action.account
      }

    case 'ETHER_BALANCE_LOADED':
      return {
        ...state,
        balance: action.balance
      }

    default:
      return state
  }
}

const DEFAULT_TOKEN_STATE = {
	loaded: false, 
	contracts: [], 
	symbol: []
}

export const tokens = (state = DEFAULT_TOKEN_STATE, action) => {
	switch(action.type) {
	case 'TOKEN_1_LOADED':
		return {
			loaded: true,
			contracts:[...state.contracts, action.token],
			symbol: [...action.symbol, action.symbol]
		}
	case 'TOKEN_2_LOADED':
		return {
			loaded: true,
			contracts:[...state.contracts, action.token],
			symbol: [...state.symbol, action.symbol]
		}


	default:
		return state
	}
}

const DEFAULT_EXCHANGE_STATE = {
	loaded: false, 
	contract: {}
}

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
	switch(action.type) {
	case 'EXCHANGE_LOADED':
		return {
			...state,
			loaded: true,
			contract: action.exchange
		}

	default:
		return state
	}
}
