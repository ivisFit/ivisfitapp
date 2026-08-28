import { Box, Typography } from "@mui/material"
import { Star } from "lucide-react"
import FormatQuoteIcon from "@mui/icons-material/FormatQuote"

type TestimonioProps = {
  nombre: string;
  role?: string;
  textos: string[];
};

export const Testimonio = ({ nombre, role = "Alumna Ivis Fit", textos }: TestimonioProps) => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
        p: { xs: 3, md: 3.5 },
        borderRadius: "18px",
        background:
          "linear-gradient(160deg, rgba(22,18,16,0.92) 0%, rgba(12,10,9,0.94) 100%)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(253, 201, 21, 0.22)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
        overflow: "hidden",
        transition: "transform .35s ease, border-color .35s ease, box-shadow .35s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          borderColor: "rgba(253, 201, 21, 0.55)",
          boxShadow: "0 24px 55px rgba(0,0,0,0.55)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 6,
          right: 10,
          opacity: 0.08,
          pointerEvents: "none",
        }}
      >
        <FormatQuoteIcon sx={{ fontSize: "5rem", color: "#fdc915", transform: "rotate(180deg)" }} />
      </Box>

      <Box sx={{ display: "flex", gap: "3px", mb: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={18} color="#fdc915" fill="#fdc915" />
        ))}
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, flexGrow: 1 }}>
        {textos.map((t, i) => (
          <Typography
            key={i}
            component="p"
            sx={{
              color: "rgba(255,255,255,0.82)",
              fontStyle: "italic",
              fontSize: { xs: "0.95rem", md: "1rem" },
              lineHeight: 1.65,
              mb: i < textos.length - 1 ? 1.4 : 0,
            }}
          >
            {t}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mt: 3,
          pt: 2.5,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1.1rem",
            color: "#1f1402",
            background: "linear-gradient(135deg, #fdc915 0%, #f0a500 100%)",
            boxShadow: "0 6px 16px rgba(253,201,21,0.3)",
          }}
        >
          {nombre.charAt(0).toUpperCase()}
        </Box>
        <Box>
          <Typography sx={{ color: "white", fontWeight: 700, fontSize: "1rem", lineHeight: 1.2 }}>
            {nombre}
          </Typography>
          <Typography
            sx={{
              color: "#fdc915",
              fontSize: "0.72rem",
              letterSpacing: "0.06rem",
              textTransform: "uppercase",
            }}
          >
            {role}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
