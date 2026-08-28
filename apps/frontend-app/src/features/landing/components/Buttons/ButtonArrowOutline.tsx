import { FC } from 'react';
import styled from 'styled-components';
import { FaArrowRight } from 'react-icons/fa';
import { cardLayout } from '../Card/cardTypography';
import { landingButtonFocusStyles } from './landingButtonStyles';

interface ButtonArrowOutlineProps {
  text: string;
  onClick?: () => void;
}

const Button = styled.button`
  background-color: transparent;
  color: var(--brand-gold);
  font-size: 0.85rem;
  padding: 0.45rem 1.35rem;
  border: 1.5px solid var(--brand-gold);
  border-radius: ${cardLayout.buttonRadius};
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.02rem;
  transition: background-color 0.3s ease, transform 0.3s ease,
    border-color 0.3s ease, color 0.3s ease;

  svg {
    font-size: 0.75rem;
  }

  &:hover {
    background-color: rgba(225, 170, 67, 0.12);
    border-color: #ffffff;
    color: #ffffff;
    transform: translateY(-2px);
  }

  ${landingButtonFocusStyles}
`;

export const ButtonArrowOutline: FC<ButtonArrowOutlineProps> = ({ text, onClick }) => {
  return (
    <Button onClick={onClick}>
      {text}
      <FaArrowRight />
    </Button>
  );
};
