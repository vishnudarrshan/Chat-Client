import React, { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import ScrollToBottom from "react-scroll-to-bottom";

interface Message {
  room: string;
  author: string;
  message: string;
  time: string;
}

interface ChatProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket: any;
  username: string;
  room: string;
}

const Chat: React.FC<ChatProps> = ({ socket, username, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData: Message = {
        room: room,
        author: username,
        message: currentMessage,
        time: `${new Date(Date.now()).getHours()}:${new Date(
          Date.now()
        ).getMinutes()}`,
      };

      await socket.emit("send_message", messageData);
      setActiveUsers((users) => new Set(users).add(messageData.author));
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const receiveMessageHandler = (data: Message) => {
      window.alert("You have a new message!");
      setMessageList((list) => [...list, data]);
      setActiveUsers((users) => new Set(users).add(data.author));
    };

    socket.on("receive_message", receiveMessageHandler);

    return () => {
      socket.removeListener("receive_message", receiveMessageHandler);
    };
  }, [socket]);

  const activeUserArray = Array.from(activeUsers); // Convert Set to Array for rendering

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="active-users">
        <p>Active Users:</p>
        <ul>
          {activeUserArray.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => (
            <div
              key={index}
              className="message"
              id={username === messageContent.author ? "you" : "other"}
            >
              <div>
                <div className="message-content">
                  <p>{messageContent.message}</p>
                </div>
                <div className="message-meta">
                  <p id="time">{messageContent.time}</p>
                  <p id="author">{messageContent.author}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          placeholder="Hey..."
          value={currentMessage}
          onChange={(e) => {
            setCurrentMessage(e.target.value);
          }}
          onKeyDown={(e) => {
            e.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
