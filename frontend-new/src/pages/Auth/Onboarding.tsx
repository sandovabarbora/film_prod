import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.primary.dark};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const OnboardingCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.xxl};
  width: 100%;
  max-width: 600px;
`;

const Progress = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ProgressDot = styled.div<{ active: boolean; completed: boolean }>`
  width: 40px;
  height: 4px;
  background: ${({ theme, active, completed }) => 
    active || completed ? theme.colors.accent.main : theme.colors.gray[700]};
  border-radius: 2px;
  transition: all ${({ theme }) => theme.transitions.normal};
`;

const StepContainer = styled.div`
  min-height: 400px;
  display: flex;
  flex-direction: column;
`;

const StepTitle = styled.h2`
  font-size: ${({ theme }) => theme.sizes.h3};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StepDescription = styled.p`
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const OptionCard = styled(motion.div)<{ selected: boolean }>`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme, selected }) => 
    selected ? theme.colors.accent.main + '20' : theme.colors.gray[850]};
  border: 2px solid ${({ theme, selected }) => 
    selected ? theme.colors.accent.main : theme.colors.gray[700]};
  border-radius: 12px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.main};
  }
  
  .icon {
    font-size: ${({ theme }) => theme.sizes.h3};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
  
  .title {
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
  
  .description {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: auto;
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme, variant = 'primary' }) => 
    variant === 'primary' ? theme.colors.accent.main : 'transparent'};
  color: ${({ theme }) => theme.colors.primary.light};
  border: 1px solid ${({ theme, variant = 'primary' }) => 
    variant === 'primary' ? theme.colors.accent.main : theme.colors.gray[700]};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme, variant = 'primary' }) => 
      variant === 'primary' ? theme.colors.accent.muted : theme.colors.gray[800]};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TeamInvite = styled.div`
  background: ${({ theme }) => theme.colors.gray[850]};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
  
  input {
    width: 100%;
    padding: ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.colors.gray[900]};
    border: 1px solid ${({ theme }) => theme.colors.gray[700]};
    border-radius: 8px;
    color: ${({ theme }) => theme.colors.primary.light};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    
    &::placeholder {
      color: ${({ theme }) => theme.colors.gray[500]};
    }
  }
`;

interface OnboardingData {
  productionType: string;
  teamSize: string;
  features: string[];
  inviteEmails: string[];
}

export const Onboarding: React.FC = () => {
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
      description: 'Select all that apply',
      options: [
        { id: 'realtime', icon: '🔴', title: 'Real-time Updates', description: 'Live collaboration' },
        { id: 'budget', icon: '💰', title: 'Budget Tracking', description: 'AI predictions' },
        { id: 'green', icon: '🌱', title: 'Green Production', description: 'Sustainability' },
        { id: 'mobile', icon: '📱', title: 'Mobile Access', description: 'On-the-go management' }
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - invite team
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save onboarding data
    localStorage.setItem('onboardingComplete', 'true');
    navigate('/');
  };

  const handleOptionSelect = (optionId: string) => {
    const stepKey = currentStep === 0 ? 'productionType' : currentStep === 1 ? 'teamSize' : 'features';
    
    if (stepKey === 'features') {
      setData(prev => ({
        ...prev,
        features: prev.features.includes(optionId) 
          ? prev.features.filter(f => f !== optionId)
          : [...prev.features, optionId]
      }));
    } else {
      setData(prev => ({
        ...prev,
        [stepKey]: optionId
      }));
    }
  };

  const isStepValid = () => {
    if (currentStep === 0) return !!data.productionType;
    if (currentStep === 1) return !!data.teamSize;
    if (currentStep === 2) return data.features.length > 0;
    return true;
  };

  return (
    <OnboardingContainer>
      <OnboardingCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Progress>
          {[0, 1, 2, 3].map((step) => (
            <ProgressDot
              key={step}
              active={step === currentStep}
              completed={step < currentStep}
            />
          ))}
        </Progress>

        <AnimatePresence mode="wait">
          {currentStep < 3 ? (
            <StepContainer key={currentStep}>
              <StepTitle>{steps[currentStep].title}</StepTitle>
              <StepDescription>{steps[currentStep].description}</StepDescription>
              
              <OptionGrid>
                {steps[currentStep].options.map((option) => (
                  <OptionCard
                    key={option.id}
                    selected={
                      currentStep === 2 
                        ? data.features.includes(option.id)
                        : (currentStep === 0 ? data.productionType : data.teamSize) === option.id
                    }
                    onClick={() => handleOptionSelect(option.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="icon">{option.icon}</div>
                    <div className="title">{option.title}</div>
                    <div className="description">{option.description}</div>
                  </OptionCard>
                ))}
              </OptionGrid>
            </StepContainer>
          ) : (
            <StepContainer key="invite">
              <StepTitle>Invite your team</StepTitle>
              <StepDescription>
                Get your crew onboard from day one
              </StepDescription>
              
              <TeamInvite>
                <h3>Send invitations</h3>
                <input type="email" placeholder="producer@company.com" />
                <input type="email" placeholder="director@company.com" />
                <input type="email" placeholder="dop@company.com" />
                <Button variant="secondary" style={{ width: '100%', marginTop: '1rem' }}>
                  + Add more
                </Button>
              </TeamInvite>
              
              <p style={{ textAlign: 'center', color: '#999', fontSize: '0.875rem' }}>
                You can always invite more team members later
              </p>
            </StepContainer>
          )}
        </AnimatePresence>

        <NavigationButtons>
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
            disabled={!isStepValid()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginLeft: 'auto' }}
          >
            {currentStep < 3 ? 'Next' : 'Complete Setup'}
          </Button>
        </NavigationButtons>
      </OnboardingCard>
    </OnboardingContainer>
  );
};
