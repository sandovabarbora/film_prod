// src/components/layout/Container/Container.tsx
import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.gray[850]};
`;

export default Container;