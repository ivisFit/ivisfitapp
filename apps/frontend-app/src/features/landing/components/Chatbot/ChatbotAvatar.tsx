export const CHATBOT_AVATAR_SRC = "/chatbot-avatar.png";

type ChatbotAvatarProps = {
  className?: string;
};

export function ChatbotAvatar({ className }: ChatbotAvatarProps) {
  return (
    <img
      src={CHATBOT_AVATAR_SRC}
      alt=""
      className={className}
      aria-hidden
      draggable={false}
    />
  );
}
