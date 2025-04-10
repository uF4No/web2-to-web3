import React from 'react'
import { useMessages } from '../hooks/useMessages'
import { useAccount } from 'wagmi'

export function MessageList() {
  const { messages, isLoading, hasMore, loadMoreMessages, sendMessage, isSending } = useMessages()
  const { address } = useAccount()
  const [newMessage, setNewMessage] = React.useState('')
  
  // Format address to show only first 6 and last 4 characters
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Handle infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    
    // When user reaches bottom, load more messages
    if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !isLoading) {
      loadMoreMessages()
    }
  }

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newMessage.trim() || !address) return
    
    try {
      await sendMessage(newMessage)
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="twitter-feed-container">
      {/* Compose new message section at the top */}
      <div className="compose-message-section">
        <form onSubmit={handleSendMessage} className="compose-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="What's happening?"
            disabled={!address || isSending}
            className="compose-input"
          />
          <button 
            type="submit" 
            disabled={!address || isSending || !newMessage.trim()}
            className="compose-button"
          >
            {isSending ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
      
      {/* Message feed */}
      <div className="message-feed" onScroll={handleScroll}>
        {/* Messages display newest first - no need for reverse() now */}
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message-post ${msg.sender === address ? 'my-post' : ''}`}
          >
            <div className="post-header">
              <span className="post-author">{formatAddress(msg.sender)}</span>
              <span className="post-time">
                {new Date(Number(msg.timestamp) * 1000).toLocaleString()}
              </span>
            </div>
            <div className="post-content">{msg.message}</div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="loading-indicator">
            Loading messages...
          </div>
        )}
        
        {/* Load more button at the bottom */}
        {hasMore && !isLoading && (
          <button 
            onClick={loadMoreMessages} 
            className="load-more-button"
          >
            Show older posts
          </button>
        )}
      </div>
    </div>
  )
} 
