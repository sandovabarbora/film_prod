import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  navItems: NavItem[];
}

const SidebarContainer = styled(motion.aside)`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.primary.dark};
  color: ${({ theme }) => theme.colors.primary.light};
  z-index: 100;
  overflow: hidden;
  border-right: 1px solid ${({ theme }) => theme.colors.gray[900]};
`;

const NavList = styled.ul`
  list-style: none;
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;

const NavItemWrapper = styled.li`
  position: relative;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.gray[300]};
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary.light};
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &.active {
    color: ${({ theme }) => theme.colors.accent.main};
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background-color: ${({ theme }) => theme.colors.accent.main};
    }
  }
`;

const IconWrapper = styled.span`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Label = styled(motion.span)`
  font-size: ${({ theme }) => theme.sizes.body};
  font-weight: 500;
  white-space: nowrap;
`;

const Logo = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.sizes.h5};
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.colors.accent.main};
`;

export const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <SidebarContainer
      initial={{ width: 80 }}
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <Logo>
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.span
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              FILMAPP
            </motion.span>
          ) : (
            <motion.span
              key="short"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              F
            </motion.span>
          )}
        </AnimatePresence>
      </Logo>
      
      <NavList>
        {navItems.map((item) => (
          <NavItemWrapper key={item.id}>
            <StyledNavLink to={item.path}>
              <IconWrapper>{item.icon}</IconWrapper>
              <AnimatePresence>
                {isExpanded && (
                  <Label
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </Label>
                )}
              </AnimatePresence>
            </StyledNavLink>
          </NavItemWrapper>
        ))}
      </NavList>
    </SidebarContainer>
  );
};
