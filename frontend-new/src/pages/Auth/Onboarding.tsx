import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const OnboardingContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.primary?.dark || '#1a1a1a'};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

const OnboardingCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gray?.[900] || '#1f1f1f'};
  border: 1px solid ${({ theme }) => theme.colors.gray?.[700] || '#333'};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing?.xl || '2rem'};
  width: 100%;
  max-width: 600px;
  text-align: center;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing?.xl || '2rem'};
  
  .step {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.5rem;
    font-weight: 600;
    transition: all ${({ theme }) => theme.transitions?.fast || '0.15s ease'};
    
    &.active {
      background: ${({ theme }) => theme.colors.accent?.main || '#667eea'};
      color: white;
    }
    
    &.completed {
      background: ${({ theme }) => theme.colors.success || '#10b981'};
      color: white;
    }
    
    &.pending {
      background: ${({ theme }) => theme.colors.gray?.[700] || '#333'};
      color: ${({ theme }) => theme.colors.gray?.[400] || '#9ca3af'};
    }
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.sizes?.h2 || '2.25rem'};
  margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
  color: ${({ theme }) => theme.colors.primary?.light || '#fff'};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.gray?.[400] || '#9ca3af'};
  margin-bottom: ${({ theme }) => theme.spacing?.xl || '2rem'};
  font-size: ${({ theme }) => theme.sizes?.lg || '1.125rem'};
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  margin-bottom: ${({ theme }) => theme.spacing?.xl || '2rem'};
`;

const OptionCard = styled(motion.div)<{ selected?: boolean }>`
  background: ${({ theme, selected }) => 
    selected 
      ? theme.colors.accent?.main || '#667eea'
      : theme.colors.gray?.[850] || '#262626'
  };
  border: 2px solid ${({ theme, selected }) => 
    selected 
      ? theme.colors.accent?.main || '#667eea'
      : theme.colors.gray?.[700] || '#333'
  };
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
  cursor: pointer;
  text-align: center;
  transition: all ${({ theme }) => theme.transitions?.fast || '0.15s ease'};
  
  .icon {
    font-size: 2rem;
    margin-bottom: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
  }
  
  .title {
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    color: ${({ theme, selected }) => 
      selected ? 'white' : theme.colors.primary?.light || '#fff'
    };
  }
  
  .description {
    font-size: ${({ theme }) => theme.sizes?.sm || '0.875rem'};
    color: ${({ theme, selected }) => 
      selected 
        ? 'rgba(255,255,255,0.8)' 
        : theme.colors.gray?.[400] || '#9ca3af'
    };
  }
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.accent?.main || '#667eea'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  justify-content: center;
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing?.md || '1rem'} ${({ theme }) => theme.spacing?.xl || '2rem'};
  background: ${({ theme, variant = 'primary' }) => 
    variant === 'primary' ? theme.colors.accent?.main || '#667eea' : 'transparent'};
  color: white;
  border: 1px solid ${({ theme, variant = 'primary' }) => 
    variant === 'primary' ? theme.colors.accent?.main || '#667eea' : theme.colors.gray?.[700] || '#333'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions?.fast || '0.15s ease'};
  
  &:hover {
    background: ${({ theme, variant = 'primary' }) => 
      variant === 'primary' ? theme.colors.accent?.muted || '#5a67d8' : theme.colors.gray?.[800] || '#1f1f1f'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TeamInvite = styled.div`
  background: ${({ theme }) => theme.colors.gray?.[850] || '#262626'};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
  margin-bottom: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
  text-align: left;
  
  h3 {
    margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
    color: ${({ theme }) => theme.colors.primary?.light || '#fff'};
  }
  
  input {
    width: 100%;
    padding: ${({ theme }) => theme.spacing?.md || '1rem'};
    background: ${({ theme }) => theme.colors.gray?.[900] || '#1f1f1f'};
    border: 1px solid ${({ theme }) => theme.colors.gray?.[700] || '#333'};
    border-radius: 8px;
    color: ${({ theme }) => theme.colors.primary?.light || '#fff'};
    margin-bottom: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
    
    &::placeholder {
      color: ${({ theme }) => theme.colors.gray?.[500] || '#6b7280'};
    }
  }
`;

interface OnboardingData {
  productionType: string;
  teamSize: string;
  features: string[];
  inviteEmails: string[];
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    productionType: '',
    teamSize: '',
    features: [],
    inviteEmails: []
  });

  const steps = [
    {
      title: 'What type of production?',
      description: 'This helps us customize your experience',
      options: [
        { id: 'feature', icon: '🎬', title: 'Feature Film', description: 'Full-length movies' },
        { id: 'series', icon: '📺', title: 'TV Series', description: 'Episodic content' },
        { id: 'commercial', icon: '📹', title: 'Commercial', description: 'Ad campaigns' },
        { id: 'documentary', icon: '📽️', title: 'Documentary', description: 'Non-fiction' }
      ]
    },
    {
      title: 'How big is your crew?',
      description: 'We\'ll optimize features for your team size',
      options: [
        { id: 'small', icon: '👥', title: 'Small (1-20)', description: 'Indie productions' },
        { id: 'medium', icon: '👥👥', title: 'Medium (21-50)', description: 'Standard productions' },
        { id: 'large', icon: '👥👥👥', title: 'Large (51-100)', description: 'Major productions' },
        { id: 'xlarge', icon: '🏢', title: 'XL (100+)', description: 'Studio productions' }
      ]
    },
    {
      title: 'Which features are most important?',
      description: 'Select all that apply to your workflow',
      options: [
        { id: 'scheduling', icon: '📅', title: 'Scheduling', description: 'Call sheets & timeline' },
        { id: 'budget', icon: '💰', title: 'Budget Tracking', description: 'Cost management' },
        { id: 'crew', icon: '👥', title: 'Crew Management', description: 'Contact & roles' },
        { id: 'documents', icon: '📄', title: 'Documents', description: 'Scripts & files' }
      ]
    }
  ];

  const currentStepData = steps[currentStep];

  const handleOptionSelect = (optionId: string) => {
    if (currentStep === 0) {
      setData(prev => ({ ...prev, productionType: optionId }));
    } else if (currentStep === 1) {
      setData(prev => ({ ...prev, teamSize: optionId }));
    } else if (currentStep === 2) {
      setData(prev => ({
        ...prev,
        features: prev.features.includes(optionId)
          ? prev.features.filter(f => f !== optionId)
          : [...prev.features, optionId]
      }));
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return data.productionType;
    if (currentStep === 1) return data.teamSize;
    if (currentStep === 2) return data.features.length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <OnboardingContainer>
      <OnboardingCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={currentStep}
      >
        <StepIndicator>
          {steps.map((_, index) => (
            <div
              key={index}
              className={`step ${
                index < currentStep 
                  ? 'completed' 
                  : index === currentStep 
                    ? 'active' 
                    : 'pending'
              }`}
            >
              {index + 1}
            </div>
          ))}
        </StepIndicator>

        <Title>{currentStepData.title}</Title>
        <Description>{currentStepData.description}</Description>

        <OptionsGrid>
          {currentStepData.options.map((option) => {
            const isSelected = currentStep === 0 
              ? data.productionType === option.id
              : currentStep === 1
                ? data.teamSize === option.id
                : data.features.includes(option.id);

            return (
              <OptionCard
                key={option.id}
                selected={isSelected}
                onClick={() => handleOptionSelect(option.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="icon">{option.icon}</div>
                <div className="title">{option.title}</div>
                <div className="description">{option.description}</div>
              </OptionCard>
            );
          })}
        </OptionsGrid>

        {currentStep === steps.length - 1 && (
          <TeamInvite>
            <h3>Invite your team (optional)</h3>
            <input type="email" placeholder="team@example.com" />
            <input type="email" placeholder="director@example.com" />
          </TeamInvite>
        )}

        <ButtonGroup>
          {currentStep > 0 && (
            <Button
              variant="secondary"
              onClick={handleBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {currentStep === steps.length - 1 ? 'Start Production' : 'Continue'}
          </Button>
        </ButtonGroup>
      </OnboardingCard>
    </OnboardingContainer>
  );
};

export default Onboarding;
