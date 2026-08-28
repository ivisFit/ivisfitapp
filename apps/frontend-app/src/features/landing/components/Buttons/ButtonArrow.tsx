import { FC } from 'react';
import styled from 'styled-components';
import { FaArrowRight } from 'react-icons/fa';
import { cardLayout } from '../Card/cardTypography';
import { landingButtonFocusStyles } from './landingButtonStyles';

interface ButtonArrowProps {
  text: string;
  onClick?: () => void;
}

const Button = styled.button`
  background: var(--brand-gold-gradient, linear-gradient(135deg, #fdc915 0%, #e1aa43 55%, #c7980a 100%));
  color: #1f1402;
  font-family: var(--font-body, "Archivo", sans-serif);
  font-size: 1rem;
  padding: 1.1rem 2.1rem;
  border: none;
  border-radius: ${cardLayout.buttonRadius};
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  box-shadow: 0 14px 30px rgba(253, 201, 21, 0.32);
  transition: filter 0.3s ease, transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(253, 201, 21, 0.42);
  }

  &:active {
    transform: translateY(0);
  }

  ${landingButtonFocusStyles}
`;

export const ButtonArrow: FC<ButtonArrowProps> = ({ text, onClick }) => {
  return (
    <Button onClick={onClick}>
      {text}
      <FaArrowRight className="landing-btn-arrow-icon" />
    </Button>
  );
};