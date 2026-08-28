import { FC } from 'react';
import styled from 'styled-components';

interface ButtonArrowProps {
  text: string;
  onClick?: () => void;
}

const Button = styled.button`
  margin: 8px 20px;
  background-color: #ffffff;
  color: #090708;
  font-size: 1rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 999px;
  display: flex;
  text-align:center;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.02rem;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.18);
  transition: background-color 0.3s ease, transform 0.3s ease,
    box-shadow 0.3s ease;
  width: 60vw;
  &:hover {
    background-color: #090708;
    color: #ffffff;
    transform: translateY(-2px);
  }
`;

export const ButtonWhite2: FC<ButtonArrowProps> = ({ text, onClick }) => {
  return (
    <Button onClick={onClick}>
      {text}
    </Button>
  );
};