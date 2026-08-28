import { FC } from 'react';
import styled from 'styled-components';
import { FaArrowRight } from 'react-icons/fa';

interface ButtonArrowProps {
  text: string;
  onClick?: () => void;
}

const Button = styled.button`
  background-color: transparent;
  color: #ffffff;
  font-size: 1rem;
  padding: 1.1rem 2.1rem;
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.02rem;
  backdrop-filter: blur(4px);
  transition: background-color 0.3s ease, transform 0.3s ease,
    border-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.12);
    border-color: #fdc915;
    color: #fdc915;
    transform: translateY(-2px);
  }
`;

export const ButtonArrowOscuro: FC<ButtonArrowProps> = ({ text, onClick }) => {
  return (
    <Button onClick={onClick}>
      {text}
      <FaArrowRight />
    </Button>
  );
};