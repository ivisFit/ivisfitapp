import { FC } from 'react';
import styled from 'styled-components';
import { FaArrowRight } from 'react-icons/fa';

interface ButtonArrowProps {
  text: string;
  onClick?: () => void;
}

const Button = styled.button`
  background-color: #fdc915;
  color: #1f1402;
  font-size: 1rem;
  padding: 1.1rem 2.1rem;
  border: none;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.02rem;
  box-shadow: 0 14px 30px rgba(253, 201, 21, 0.32);
  transition: background-color 0.3s ease, transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    background-color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);
  }
`;

export const ButtonArrow: FC<ButtonArrowProps> = ({ text, onClick }) => {
  return (
    <Button onClick={onClick}>
      {text}
      <FaArrowRight />
    </Button>
  );
};