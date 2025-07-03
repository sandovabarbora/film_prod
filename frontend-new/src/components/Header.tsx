import React from 'react';
import styled from 'styled-components';
import { Bell, Search, User } from 'lucide-react';

const HeaderContainer = styled.header`
  height: 64px;
  background: ${({ theme }) => theme.colors.gray[900]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[800]};
  padding: 0 ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SearchSection = styled.div`
  flex: 1;
  max-width: 400px;
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.gray[500]};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  padding-left: 40px;
  background: ${({ theme }) => theme.colors.gray[850]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.primary.light};
  font-size: ${({ theme }) => theme.sizes.small};

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[500]};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.main};
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const NotificationButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.gray[400]};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.light};
  }
`;

const NotificationDot = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.accent.main};
  border-radius: 50%;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const UserInfo = styled.div`
  text-align: right;
`;

const UserName = styled.p`
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary.light};
`;

const UserRole = styled.p`
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.gray[500]};
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gray[700]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Header: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <HeaderContainer>
      <SearchSection>
        <SearchWrapper>
          <SearchIcon size={20} />
          <SearchInput
            type="text"
            placeholder="Search..."
          />
        </SearchWrapper>
      </SearchSection>
      
      <RightSection>
        <NotificationButton>
          <Bell size={24} />
          <NotificationDot />
        </NotificationButton>
        
        <UserSection>
          <UserInfo>
            <UserName>{user.name || 'User'}</UserName>
            <UserRole>{user.role || 'Producer'}</UserRole>
          </UserInfo>
          <UserAvatar>
            <User size={24} color="#9CA3AF" />
          </UserAvatar>
        </UserSection>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
