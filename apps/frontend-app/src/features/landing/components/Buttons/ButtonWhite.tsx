import { FC } from 'react';
import styled from 'styled-components';

interface ButtonArrowProps {
  text: string;
  onClick?: () => void;
}

const Button = styled.button`
  background-color: #ffffff;
  color: #090708;
  font-size: 1rem;
  padding: 1rem 2.1rem;
  border: none;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.02rem;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.18);
  transition: background-color 0.3s ease, transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    background-color: #090708;
    color: #ffffff;
    transform: translateY(-2px);
  }
`;

export const ButtonWhite: FC<ButtonArrowProps> = ({ text, onClick }) => {
  return (
      <a href="#planes-section" style={{textDecoration:"none", cursor:"pointer", color:"white", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem"}}>
    <Button onClick={onClick}>
      {text}
    </Button>
      </a>
  );
};