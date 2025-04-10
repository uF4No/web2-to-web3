import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { MessageList } from './components/MessageList'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div className="app-container">
      <header>
        <h1>Decentralized Messaging</h1>
        <div className="wallet-connection">
          {account.status === 'connected' ? (
            <div className="account-info">
              <span className="wallet-address">
                Connected: {account.addresses?.[0].slice(0, 6)}...{account.addresses?.[0].slice(-4)}
              </span>
              <button type="button" onClick={() => disconnect()} className="disconnect-button">
                Disconnect
              </button>
            </div>
          ) : (
            <div className="connect-buttons">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  type="button"
                  className="connect-button"
                >
                  Connect with {connector.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main>
        {account.status === 'connected' ? (
          <MessageList />
        ) : (
          <div className="connect-prompt">
            Please connect your wallet to access the messaging app
          </div>
        )}
      </main>
      
      {error && <div className="error-message">{error.message}</div>}
      {status === 'pending' && <div className="status-message">Connecting...</div>}
    </div>
  )
}

export default App
