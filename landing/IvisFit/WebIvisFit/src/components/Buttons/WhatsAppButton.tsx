// WhatsAppButton.tsx
import { FC } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaWhatsapp } from 'react-icons/fa';

interface WhatsAppButtonProps {
  phoneNumber: string;
}

const heartbeat = keyframes`
  0% {
    transform: scale(1);
  }
  5% {
    transform: scale(1.1);
  }
  10% {
    transform: scale(1);
  }
  15% {
    transform: scale(1.1);
  }
  20% {
    transform: scale(1);
  }
  100% {
    transform: scale(1);
  }
`;

const FloatingButton = styled.a`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #25D366;
  color: white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  text-decoration: none;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  z-index: 1000;
  animation: ${heartbeat} 5s infinite ease-in-out;

  &:hover {
    background-color: #1ebe57;
    animation: none;
    transform: scale(1.1) rotate(5deg);
  }
`;

const teaserIn = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const bob = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
`;

const lookAround = keyframes`
  0%, 12%   { transform: translate(0, 0); }
  20%, 30%  { transform: translate(2.5px, -1.5px); }
  38%, 48%  { transform: translate(-2.5px, 1px); }
  56%, 66%  { transform: translate(2px, 2px); }
  74%, 84%  { transform: translate(-2px, -2px); }
  92%, 100% { transform: translate(0, 0); }
`;

const blink = keyframes`
  0%, 92%, 100% { transform: scaleY(1); }
  96%           { transform: scaleY(0.1); }
`;

const TeaserBubble = styled.div`
  position: fixed;
  bottom: 30px;
  right: 92px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 14px;
  max-width: 230px;
  background: linear-gradient(160deg, #1b1714 0%, #100d0b 100%);
  border: 1px solid rgba(253, 201, 21, 0.45);
  border-radius: 999px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45);
  animation: ${teaserIn} 0.5s ease both, ${bob} 4s ease-in-out 0.5s infinite;
  pointer-events: none;

  @media (max-width: 480px) {
    max-width: 180px;
    padding: 8px 12px;
    bottom: 28px;
    right: 86px;
  }
`;

const TeaserText = styled.span`
  color: #ffffff;
  font-family: "Poppins", sans-serif;
  font-size: 0.74rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.01rem;
  white-space: nowrap;

  b {
    color: #fdc915;
    font-weight: 700;
  }

  @media (max-width: 480px) {
    font-size: 0.68rem;
    white-space: normal;
  }
`;

const Eyes = styled.span`
  display: inline-flex;
  gap: 3px;
  flex-shrink: 0;
`;

const Eye = styled.span`
  position: relative;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: inset 0 -1px 2px rgba(0, 0, 0, 0.15);
  animation: ${blink} 4.5s ease-in-out infinite;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6.5px;
    height: 6.5px;
    margin: -3.25px 0 0 -3.25px;
    border-radius: 50%;
    background: #1b1714;
    animation: ${lookAround} 5s ease-in-out infinite;
  }
`;

export const WhatsAppButton: FC<WhatsAppButtonProps> = ({ phoneNumber }) => {
  const sanitizedNumber = phoneNumber.replace(/\D/g, "");
  const message = "¡Hola! Estuve viendo tus planes 2026 y me encantaría entrenar con propósito. ¿Podrías contarme cuál sería el ideal para mí?";
  const whatsappLink = `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <TeaserBubble role="status" aria-label="Preparando algo gigante">
        <TeaserText>
          Preparando algo <b>gigante</b>...
        </TeaserText>
        <Eyes aria-hidden="true">
          <Eye />
          <Eye />
        </Eyes>
      </TeaserBubble>
      <FloatingButton href={whatsappLink} target="_blank" rel="noopener noreferrer">
        <FaWhatsapp />
      </FloatingButton>
    </>
  );
};