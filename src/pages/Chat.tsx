import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { getConversationMessages, createMessage } from '../../api/messages'; 
import { getConversations } from '../../api/conversations'; 


interface ChatProps {}

const Chat: React.FC<ChatProps> = () => {
  const user = useSelector((state: RootState) => state.auth.user); 
  const token = useSelector((state: RootState) => state.auth.user?.token); 
  const [messages, setMessages] = useState<any[]>([]); 
  const [newMessage, setNewMessage] = useState(''); 
  const chatBodyRef = useRef<HTMLDivElement>(null); 
  const [contacts, setContacts] = useState<any[]>([]); 
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null); 

  useEffect(() => {
    const loadContacts = async () => {
     if (token) {
         try {
           const fetchedContacts = await getConversations(token); 
           setContacts(fetchedContacts.conversations);
           if (fetchedContacts.conversations.length > 0) {
             setSelectedContactId(fetchedContacts.conversations[0].id);
           }
        } catch (error: any) {
           console.error('Error loading contacts:', error);
         }
       }
     };
     loadContacts();

    // Fetch messages for the selected contact
    const loadMessages = async () => {
      if (token && selectedContactId) {
         try {
           const fetchedMessages = await getConversationMessages(selectedContactId, token);
           setMessages(fetchedMessages);
           if (chatBodyRef.current) {
             chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
           }
         } catch (error: any) {
           console.error('Error loading messages:', error);
         }

        if (chatBodyRef.current) {
          chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
      } else {
        setMessages([]); 
      }
    };

    loadMessages();
  }, [token, selectedContactId, user?.username]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token && newMessage.trim() && selectedContactId) {
       try {
         await createMessage(selectedContactId, newMessage, token); 
         setNewMessage('');
         setMessages(prevMessages => [...prevMessages, { sender: user?.username || 'You', content: newMessage }]);
         if (chatBodyRef.current) {
           chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
       } catch (error: any) {
         console.error('Error sending message:', error);
      }
     
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const handleContactClick = (contactId: number) => {
    setSelectedContactId(contactId);
  };
  const selectedContact = contacts.find(contact => contact.id === selectedContactId);

  return (
    <div className="flex h-screen bg-gray-800 text-gray-100">
      <aside className="w-64 bg-gray-900 flex flex-col">
        <div className="p-3">
          <h3 className="text-gray-400 mb-2">Direct Messages</h3>
          <ul className="list-none p-0 m-0 overflow-y-auto">
            {contacts.map(contact => (
              <li
                key={contact.id}
                className={`p-2 cursor-pointer rounded hover:bg-gray-700 ${
                  selectedContactId === contact.id ? 'bg-gray-700' : ''
                }`}
                onClick={() => handleContactClick(contact.id)}
              >
                {contact.username}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-gray-800">
        <div className="bg-gray-700 p-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold">{selectedContact ? selectedContact.username : 'Select a Contact'}</h3>
        </div>
        <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className="mb-2">
              <span className="font-semibold text-gray-400 mr-2">{msg.sender}:</span> {msg.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="bg-gray-700 p-4 border-t border-gray-600 flex items-center">
          <input
            type="text"
            placeholder={`Message ${selectedContact ? selectedContact.username : 'a contact'}`}
            value={newMessage}
            onChange={handleInputChange}
            className="flex-1 bg-gray-900 text-gray-100 border border-gray-600 rounded-md p-2 mr-2"
          />
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-md p-2">
            Send
          </button>
        </form>
      </main>
    </div>
  );
};

export default Chat;