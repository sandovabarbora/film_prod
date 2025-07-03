import React, { useState } from 'react';
import styled from 'styled-components';
import { MessageSquare, Send, Hash, Lock, Users, Search, Paperclip, Smile, MoreVertical } from 'lucide-react';

const CommunicationContainer = styled.div`
  display: flex;
  height: calc(100vh - 64px);
  background: ${({ theme }) => theme.colors.gray[850]};
`;

const ChannelSidebar = styled.div`
  width: 280px;
  background: ${({ theme }) => theme.colors.gray[800]};
  border-right: 1px solid ${({ theme }) => theme.colors.gray[700]};
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[700]};
`;

const ProjectName = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const SearchChannels = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  background: ${({ theme }) => theme.colors.gray[700]};
  border: 1px solid ${({ theme }) => theme.colors.gray[600]};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ChannelList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const ChannelSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
`;

const Channel = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  color: ${props => props.$active ? props.theme.colors.text.primary : props.theme.colors.text.secondary};
  background: ${props => props.$active ? props.theme.colors.gray[700] : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.25rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[700]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }
`;

const ChannelName = styled.span`
  font-size: 0.875rem;
  font-weight: ${props => props.$unread ? '600' : '400'};
`;

const UnreadCount = styled.span`
  margin-left: auto;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-weight: 600;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[700]};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const ChatInfo = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MessageGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  flex: 1;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const MessageAuthor = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MessageTime = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MessageText = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.5;
`;

const MessageInput = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[700]};
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
`;

const TextInput = styled.textarea`
  flex: 1;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const InputActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[700]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const SendButton = styled(IconButton)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const Communication: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState('general');
  
  const channels = {
    public: [
      { id: 'general', name: 'general', icon: Hash, unread: 3 },
      { id: 'production', name: 'production', icon: Hash },
      { id: 'locations', name: 'locations', icon: Hash },
      { id: 'dailies', name: 'dailies', icon: Hash, unread: 1 },
    ],
    private: [
      { id: 'directors', name: 'directors', icon: Lock },
      { id: 'producers', name: 'producers', icon: Lock },
    ],
    direct: [
      { id: 'john-doe', name: 'John Doe', icon: Users, unread: 2 },
      { id: 'jane-smith', name: 'Jane Smith', icon: Users },
    ]
  };
  
  const messages = [
    { id: 1, author: 'John Doe', time: '10:30 AM', text: 'Good morning team! Ready for today\'s shoot?' },
    { id: 2, author: 'Jane Smith', time: '10:32 AM', text: 'Morning! Yes, all set. Equipment is loaded and ready to go.' },
    { id: 3, author: 'Mike Johnson', time: '10:35 AM', text: 'Weather looks good for the outdoor scenes. Clear skies until 6 PM.' },
    { id: 4, author: 'Sarah Wilson', time: '10:40 AM', text: 'Just confirming - call time is 11 AM at the downtown location, right?' },
    { id: 5, author: 'John Doe', time: '10:41 AM', text: 'That\'s correct! See everyone there.' },
  ];

  return (
    <CommunicationContainer>
      <ChannelSidebar>
        <SidebarHeader>
          <ProjectName>Film Production</ProjectName>
          <SearchChannels>
            <Search />
            <SearchInput placeholder="Search channels..." />
          </SearchChannels>
        </SidebarHeader>
        
        <ChannelList>
          <ChannelSection>
            <SectionTitle>Channels</SectionTitle>
            {channels.public.map(channel => (
              <Channel
                key={channel.id}
                $active={activeChannel === channel.id}
                onClick={() => setActiveChannel(channel.id)}
              >
                <channel.icon />
                <ChannelName $unread={!!channel.unread}>{channel.name}</ChannelName>
                {channel.unread && <UnreadCount>{channel.unread}</UnreadCount>}
              </Channel>
            ))}
          </ChannelSection>
          
          <ChannelSection>
            <SectionTitle>Private Channels</SectionTitle>
            {channels.private.map(channel => (
              <Channel
                key={channel.id}
                $active={activeChannel === channel.id}
                onClick={() => setActiveChannel(channel.id)}
              >
                <channel.icon />
                <ChannelName>{channel.name}</ChannelName>
              </Channel>
            ))}
          </ChannelSection>
          
          <ChannelSection>
            <SectionTitle>Direct Messages</SectionTitle>
            {channels.direct.map(channel => (
              <Channel
                key={channel.id}
                $active={activeChannel === channel.id}
                onClick={() => setActiveChannel(channel.id)}
              >
                <channel.icon />
                <ChannelName $unread={!!channel.unread}>{channel.name}</ChannelName>
                {channel.unread && <UnreadCount>{channel.unread}</UnreadCount>}
              </Channel>
            ))}
          </ChannelSection>
        </ChannelList>
      </ChannelSidebar>
      
      <ChatArea>
        <ChatHeader>
          <ChatTitle>
            <Hash />
            <h3>{activeChannel}</h3>
          </ChatTitle>
          <ChatInfo>45 members</ChatInfo>
        </ChatHeader>
        
        <MessagesContainer>
          {messages.map(message => (
            <MessageGroup key={message.id}>
              <Avatar>{message.author.split(' ').map(n => n[0]).join('')}</Avatar>
              <MessageContent>
                <MessageHeader>
                  <MessageAuthor>{message.author}</MessageAuthor>
                  <MessageTime>{message.time}</MessageTime>
                </MessageHeader>
                <MessageText>{message.text}</MessageText>
              </MessageContent>
            </MessageGroup>
          ))}
        </MessagesContainer>
        
        <MessageInput>
          <InputWrapper>
            <TextInput 
              placeholder={`Message #${activeChannel}`}
              rows={1}
            />
            <InputActions>
              <IconButton>
                <Paperclip />
              </IconButton>
              <IconButton>
                <Smile />
              </IconButton>
              <SendButton>
                <Send />
              </SendButton>
            </InputActions>
          </InputWrapper>
        </MessageInput>
      </ChatArea>
    </CommunicationContainer>
  );
};

export default Communication;