import { Box, Button, Container, Typography } from "@mui/material";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Dumbbell,
  MessageCircle,
  Smartphone,
  Target,
} from "lucide-react";
import { Footer } from "../Footer";
import { NavbarDetails } from "../NavbarDetails";
import type { Plan } from "../../data/plans";
import { getWhatsAppLink } from "../../data/plans";

type PlanDetailPageProps = {
  plan: Plan;
};

const iconCardStyles = {
  backgroundColor: "white",
  borderRadius: "18px",
  padding: "28px",
  boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
  border: "1px solid rgba(225, 170, 67, 0.18)",
};

export const PlanDetailPage = ({ plan }: PlanDetailPageProps) => {
  const whatsappLink = getWhatsAppLink(plan.title);
  const methodologyItems = [
    { icon: Target, label: "Enfoque", value: plan.focus },
    plan.methodology ? { icon: Dumbbell, label: "Metodología", value: plan.methodology } : null,
    { icon: MessageCircle, label: "Acompañamiento", value: plan.extras.join(" ") },
  ].filter(Boolean) as Array<{ icon: typeof Target; label: string; value: string }>;

  return (
    <>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <NavbarDetails />

        <Box
          sx={{
            position: "relative",
            minHeight: { xs: "86vh", md: "74vh" },
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(253, 201, 21, 0.32) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(253, 201, 21, 0.42) 0%, transparent 50%),
              linear-gradient(135deg, #FDC915 0%, #E6B512 50%, #CC9F0F 100%)
            `,
            pt: { xs: "120px", md: "150px" },
            pb: { xs: 6, md: 8 },
          }}
        >
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ maxWidth: "860px", color: "white" }}>
              <Typography
                variant="overline"
                sx={{ letterSpacing: "0.25rem", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}
              >
                {plan.badge}
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.6rem", md: "4.7rem" },
                  lineHeight: 1,
                  fontWeight: 800,
                  mt: 1,
                  mb: 3,
                }}
              >
                {plan.title}
              </Typography>
              <Typography
                variant="h5"
                sx={{ maxWidth: "760px", fontWeight: 400, lineHeight: 1.55, opacity: 0.95 }}
              >
                {plan.intro}
              </Typography>
              <Button
                component="a"
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                size="large"
                sx={{
                  mt: 5,
                  backgroundColor: "white",
                  color: "#9b741c",
                  fontWeight: 800,
                  borderRadius: "999px",
                  px: 4,
                  py: 1.5,
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                {plan.ctaLabel}
              </Button>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
              mb: { xs: 6, md: 9 },
            }}
          >
            {[
              { icon: Calendar, label: "Duración", value: plan.duration },
              { icon: Smartphone, label: "Formato", value: plan.format },
              { icon: DollarSign, label: "Inversión", value: plan.investment },
            ].map(({ icon: Icon, label, value }) => (
              <Box key={label} sx={iconCardStyles}>
                <Icon color="#e1aa43" size={34} />
                <Typography variant="overline" sx={{ display: "block", mt: 2, color: "#8a6b2b", fontWeight: 700 }}>
                  {label}
                </Typography>
                <Typography variant="h5" sx={{ color: "#1f2020", fontWeight: 800 }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ mb: { xs: 6, md: 9 }, textAlign: "center" }}>
            <Typography variant="overline" sx={{ color: "#e1aa43", letterSpacing: "0.25rem", fontWeight: 800 }}>
              Programa
            </Typography>
            <Typography
              variant="h2"
              sx={{ color: "#1f2020", fontWeight: 800, fontSize: { xs: "2rem", md: "3.2rem" }, mb: 2 }}
            >
              ¿Qué vas a trabajar?
            </Typography>
            <Typography sx={{ maxWidth: "780px", mx: "auto", color: "#4a4a4a", fontSize: "1.15rem", lineHeight: 1.7 }}>
              {plan.focus}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
              mb: { xs: 6, md: 9 },
            }}
          >
            {methodologyItems.map(({ icon: Icon, label, value }) => (
              <Box key={label} sx={{ ...iconCardStyles, backgroundColor: "#090708", color: "white" }}>
                <Icon color="#fdc915" size={34} />
                <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 800 }}>
                  {label}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.65 }}>{value}</Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: plan.benefits?.length ? "1fr 1fr" : "1fr" },
              gap: 4,
              alignItems: "start",
            }}
          >
            <Box sx={iconCardStyles}>
              <Typography variant="h3" sx={{ color: "#1f2020", fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.4rem" } }}>
                Extras incluidos
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: "24px 0 0", display: "grid", gap: 2 }}>
                {plan.extras.map((item) => (
                  <Box component="li" key={item} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <CheckCircle color="#e1aa43" size={22} />
                    <Typography sx={{ color: "#333", lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {plan.benefits?.length ? (
              <Box sx={iconCardStyles}>
                <Typography variant="h3" sx={{ color: "#1f2020", fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.4rem" } }}>
                  Beneficios clave
                </Typography>
                <Box component="ul" sx={{ listStyle: "none", p: 0, m: "24px 0 0", display: "grid", gap: 2 }}>
                  {plan.benefits.map((item) => (
                    <Box component="li" key={item} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                      <Clock color="#e1aa43" size={22} />
                      <Typography sx={{ color: "#333", lineHeight: 1.6 }}>{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : null}
          </Box>

          <Box
            sx={{
              mt: { xs: 6, md: 9 },
              p: { xs: 4, md: 6 },
              borderRadius: "24px",
              backgroundColor: "#090708",
              color: "white",
              textAlign: "center",
            }}
          >
            <Typography variant="h3" sx={{ fontSize: { xs: "2rem", md: "3rem" }, fontWeight: 800, mb: 2 }}>
              Entrena con propósito 2026
            </Typography>
            <Typography sx={{ maxWidth: "720px", mx: "auto", color: "rgba(255,255,255,0.78)", lineHeight: 1.7 }}>
              Seguimiento 100% personalizado para transformar tu vida a través del deporte, la disciplina y un plan pensado para tus objetivos.
            </Typography>
            <Button
              component="a"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              sx={{
                mt: 4,
                backgroundColor: "#e1aa43",
                color: "white",
                borderRadius: "999px",
                px: 4,
                py: 1.4,
                fontWeight: 800,
                textTransform: "none",
                "&:hover": { backgroundColor: "#b98a2d" },
              }}
            >
              {plan.ctaLabel}
            </Button>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
};
