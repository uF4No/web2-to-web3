import { useCallback, useState, useEffect } from 'react'
import { 
  useWriteContract, 
  useReadContract, 
  useWatchContractEvent,
  usePublicClient
} from 'wagmi'
import { messagesContract } from '../contracts/messagesContract'

// Define typings for our messages
interface Message {
  sender: `0x${string}`
  message: string
  timestamp: bigint
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const batchSize = 10n // Number of messages to load per batch as bigint

  // Get the public client for direct contract calls
  const publicClient = usePublicClient()
  
  // Contract write operation
  const { writeContractAsync, isPending: isSending } = useWriteContract()

  // Read latest messages
  const { data: latestMessages, refetch: refetchLatestMessages } = useReadContract({
    address: messagesContract.address,
    abi: messagesContract.abi,
    functionName: 'getLatestMessages',
    args: [batchSize],
  })

  // Get total message count
  const { data: messageCount } = useReadContract({
    address: messagesContract.address,
    abi: messagesContract.abi,
    functionName: 'getMessageCount',
  })

  // Watch for new messages
  useWatchContractEvent({
    address: messagesContract.address,
    abi: messagesContract.abi,
    eventName: 'NewMessage',
    onLogs: () => {
      // When a new message is detected, refetch the latest messages
      refetchLatestMessages()
    },
  })

  // Initialize messages on load - the contract already returns latest messages first
  useEffect(() => {
    if (latestMessages && Array.isArray(latestMessages)) {
      // The latestMessages are already in newest-first order from the contract
      setMessages(latestMessages as unknown as Message[])
      setIsLoading(false)
      setOffset(latestMessages.length)
      setHasMore(messageCount !== undefined && BigInt(latestMessages.length) < messageCount)
    }
  }, [latestMessages, messageCount])

  // Function to load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || !publicClient) return
    
    setIsLoading(true)
    try {
      // Read more messages using the public client
      const batchMessages = await publicClient.readContract({
        address: messagesContract.address,
        abi: messagesContract.abi,
        functionName: 'getMessagesBatch',
        args: [BigInt(offset), batchSize],
      })
      
      const result = batchMessages as unknown as Message[]
      
      if (result && result.length > 0) {
        // Append the older messages to the end of the array
        // since we're displaying newest first
        setMessages((prev) => [...prev, ...result])
        setOffset((prev) => prev + result.length)
        setHasMore(
          messageCount !== undefined && 
          BigInt(offset + result.length) < messageCount
        )
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more messages:', error)
    } finally {
      setIsLoading(false)
    }
  }, [offset, hasMore, messageCount, publicClient])

  // Function to send a new message
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return
    
    try {
      return await writeContractAsync({
        address: messagesContract.address,
        abi: messagesContract.abi,
        functionName: 'sendMessage',
        args: [messageText],
      })
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }, [writeContractAsync])

  return {
    messages,
    isLoading,
    hasMore,
    loadMoreMessages,
    sendMessage,
    isSending,
  }
}
