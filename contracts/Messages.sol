// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Messages
 * @dev A contract for storing and retrieving messages in an efficient way
 * This contract allows users to send messages and retrieve them in batches,
 * with support for pagination and real-time updates via events.
 */
contract Messages {
    /**
     * @dev Message structure to store message data
     * @param sender Address of the message sender
     * @param message Content of the message
     * @param timestamp Time when the message was sent
     */
    struct Message {
        address sender;
        string message;
        uint256 timestamp;
    }

    /// @dev Array to store all messages - kept private to enforce access through pagination methods
    Message[] private messages;

    /**
     * @dev Event emitted when a new message is sent
     * Frontend applications can listen to this event to update in real-time
     * @param sender Address of the message sender
     * @param message Content of the message
     * @param timestamp Time when the message was sent
     * @param messageId Unique identifier of the message (index in the array)
     */
    event NewMessage(
        address indexed sender,
        string message,
        uint256 timestamp,
        uint256 indexed messageId
    );

    /**
     * @dev Send a new message to be stored in the contract
     * @param _message Content of the message to send
     * Emits a NewMessage event that can be captured by frontend applications
     */
    function sendMessage(string memory _message) public {
        uint256 messageId = messages.length;
        messages.push(Message(msg.sender, _message, block.timestamp));

        // Emit event for frontend to listen
        emit NewMessage(msg.sender, _message, block.timestamp, messageId);
    }

    /**
     * @dev Retrieve messages in batches with pagination support
     * Returns messages in reverse chronological order (newest to oldest)
     * @param _offset Starting position for pagination (from the end of the array)
     * @param _limit Maximum number of messages to return in this batch
     * @return An array of Message structs for the requested batch
     */
    function getMessagesBatch(
        uint256 _offset,
        uint256 _limit
    ) public view returns (Message[] memory) {
        // Ensure that we don't go out of bounds
        require(_offset < messages.length, "Offset out of bounds");

        // Calculate how many messages to return
        uint256 batchSize = _limit;
        if (_offset + _limit > messages.length) {
            batchSize = messages.length - _offset;
        }

        // Create a new array for the batch
        Message[] memory batch = new Message[](batchSize);

        // Fill the batch array with messages in reverse order (newest to oldest)
        for (uint256 i = 0; i < batchSize; i++) {
            // Start from the latest message (_offset from the end)
            uint256 index = messages.length - _offset - i - 1;
            batch[i] = messages[index];
        }

        return batch;
    }

    /**
     * @dev Get the most recent messages
     * @param _count Number of latest messages to return
     * @return An array of the most recent Message structs
     */
    function getLatestMessages(
        uint256 _count
    ) public view returns (Message[] memory) {
        uint256 count = _count;
        if (count > messages.length) {
            count = messages.length;
        }

        Message[] memory latestMessages = new Message[](count);

        for (uint256 i = 0; i < count; i++) {
            // Start from the end of the array for latest messages
            latestMessages[i] = messages[messages.length - i - 1];
        }

        return latestMessages;
    }

    /**
     * @dev Get the total number of messages stored
     * @return The total count of messages
     * Useful for implementing pagination in frontend applications
     */
    function getMessageCount() public view returns (uint256) {
        return messages.length;
    }
}
