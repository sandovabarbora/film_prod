import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const JoinContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.primary.dark};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const JoinCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.xxl};
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.sizes.h3};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const CodeInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.gray[850]};
  border: 2px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.primary.light};
  font-size: ${({ theme }) => theme.sizes.h5};
  text-align: center;
  letter-spacing: 4px;
  text-transform: uppercase;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.main};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[500]};
    letter-spacing: normal;
    text-transform: none;
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.accent.main};
  color: ${({ theme }) => theme.colors.primary.light};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: ${({ theme }) => theme.sizes.body};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.lg};
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent.muted};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProductionPreview = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gray[850]};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
  text-align: left;
  
  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
  
  .info {
    display: grid;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-top: ${({ theme }) => theme.spacing.md};
    
    .row {
      display: flex;
      justify-content: space-between;
      color: ${({ theme }) => theme.colors.gray[400]};
      font-size: ${({ theme }) => theme.sizes.small};
      
      span:last-child {
        color: ${({ theme }) => theme.colors.primary.light};
      }
    }
  }
`;

export const JoinProduction: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [productionFound, setProductionFound] = useState(false);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCode(value);
    
    // Mock production lookup
    if (value.length === 8) {
      setLoading(true);
      setTimeout(() => {
        setProductionFound(true);
        setLoading(false);
      }, 1000);
    } else {
      setProductionFound(false);
    }
  };

  const handleJoin = () => {
    navigate('/');
  };

  return (
    <JoinContainer>
      <JoinCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Icon>🎬</Icon>
        <Title>Join a Production</Title>
        <Description>
          Enter the production code shared by your production manager
        </Description>
        
        <CodeInput
          type="text"
          placeholder="Enter 8-digit code"
          value={code}
          onChange={handleCodeChange}
          maxLength={8}
        />
        
        {productionFound && (
          <ProductionPreview
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>Project Sunset</h3>
            <div className="info">
              <div className="row">
                <span>Production Company</span>
                <span>Stellar Films</span>
              </div>
              <div className="row">
                <span>Start Date</span>
                <span>Nov 15, 2024</span>
              </div>
              <div className="row">
                <span>Crew Size</span>
                <span>45 members</span>
              </div>
              <div className="row">
                <span>Your Role</span>
                <span>To be assigned</span>
              </div>
            </div>
          </ProductionPreview>
        )}
        
        <Button
          onClick={handleJoin}
          disabled={!productionFound}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Checking...' : productionFound ? 'Join Production' : 'Enter Code'}
        </Button>
        
        <p style={{ marginTop: '2rem', color: '#666', fontSize: '0.875rem' }}>
          Don't have a code? <a href="/login" style={{ color: '#e50914' }}>Create new production</a>
        </p>
      </JoinCard>
    </JoinContainer>
  );
};
