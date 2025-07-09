import React from 'react';
import styled from 'styled-components';
import { Calendar, Clock, Plus } from 'lucide-react';

const Container = styled.div`
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
`;

const SimpleSchedule: React.FC<{ projectId: number }> = ({ projectId }) => {
  return (
    <Container>
      <Calendar size={48} style={{ margin: '0 auto 1rem', color: '#f97316' }} />
      <Title>Harmonogram projektu</Title>
      <Description>
        Harmonogram pro projekt #{projectId} bude implementován v další verzi.
        Tady bude kalendář s událostmi, termíny natáčení a schůzkami.
      </Description>
    </Container>
  );
};

export default SimpleSchedule;
