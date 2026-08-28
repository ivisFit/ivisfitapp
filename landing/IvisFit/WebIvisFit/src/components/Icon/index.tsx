export const Icon = ({ icon }: { icon: React.ElementType }) => {
  const IconComponent = icon;

  return (
    <div
      style={{
        width: "4rem", // w-16
        height: "4rem", // h-16
        background: "linear-gradient(135deg, #FFD700, #FFA500)", // gradient-gold
        borderRadius: "1rem", // rounded-2xl
        display: "flex", // flex
        alignItems: "center", // items-center
        justifyContent: "center", // justify-center
        margin: "0 auto 1.5rem auto", // mx-auto mb-6
        boxShadow: "0 0 10px rgba(255, 215, 0, 0.6)", // shadow-gold
        transition: "transform 0.3s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <IconComponent
        style={{
          width: "2rem", // w-8
          height: "2rem", // h-8
          color: "var(--primary-foreground)", // text-primary-foreground
        }}
      />
    </div>
  );
};
