import { FC } from 'react';
import styled from 'styled-components';
import { FaArrowRight } from 'react-icons/fa';
import { landingButtonFocusStyles } from './landingButtonStyles';

interface ButtonArrowProps {
  text: string;
  onClick?: () => void;
}

const Button = styled.button`
  background-color: transparent;
  color: #ffffff;
  font-family: var(--font-body, "Archivo", sans-serif);
  font-size: 1rem;
  padding: 1.1rem 2.1rem;
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
  transition: background-color 0.3s ease, transform 0.3s ease,
    border-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: rgba(253, 201, 21, 0.1);
    border-color: var(--brand-gold-soft);
    color: var(--brand-gold-soft);
    transform: translateY(-2px);
  }

  ${landingButtonFocusStyles}
`;

export const ButtonArrowOscuro: FC<ButtonArrowProps> = ({ text, onClick }) => {
  return (
    <Button onClick={onClick}>
      {text}
      <FaArrowRight className="landing-btn-arrow-icon" />
    </Button>
  );
};