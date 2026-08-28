"use client";

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
import {
  PlanBenefitText,
  PlanExtraText,
  PlanText,
} from "@/features/landing/cms/PlanCmsFields";
import { useContent } from "@/lib/preview-cms/lib/content-edit/useContent";
import { Footer } from "../Footer";
import { NavbarDetails } from "../NavbarDetails";
import type { Plan } from "../../data/plans";
import { getWhatsAppLink } from "../../data/plans";

type PlanDetailPageProps = {
  plan: Plan;
  slug: string;
};

const iconCardStyles = {
  backgroundColor: "white",
  borderRadius: "18px",
  padding: "28px",
  boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
  border: "1px solid rgba(225, 170, 67, 0.18)",
};

export const PlanDetailPage = ({ plan, slug }: PlanDetailPageProps) => {
  const { text } = useContent();
  const title = text(`planes.bySlug.${slug}.title`) || plan.title;
  const whatsappLink = getWhatsAppLink(title);
  const methodology = text(`planes.bySlug.${slug}.methodology`) || plan.methodology || "";
  const isDraftPreview = plan.isActive === false;

  const methodologyItems = [
    { icon: Target, label: "Enfoque", content: <PlanText slug={slug} field="focus" /> },
    methodology
      ? {
          icon: Dumbbell,
          label: "Metodología",
          content: <PlanText slug={slug} field="methodology" multiline />,
        }
      : null,
    {
      icon: MessageCircle,
      label: "Acompañamiento",
      content: (
        <Box component="span">
          {plan.extras.map((_, index) => (
            <Box component="span" key={index} sx={{ display: "block" }}>
              <PlanExtraText slug={slug} index={index} />
            </Box>
          ))}
        </Box>
      ),
    },
  ].filter(Boolean) as Array<{
    icon: typeof Target;
    label: string;
    content: React.ReactNode;
  }>;

  return (
    <>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <NavbarDetails />
        {isDraftPreview ? (
          <Box
            sx={{
              px: 2,
              py: 1,
              textAlign: "center",
              backgroundColor: "#14110f",
              color: "#fdc915",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Vista previa — plan no publicado
          </Box>
        ) : null}

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
              linear-gradient(135deg, var(--brand-gold-soft) 0%, #E6B512 50%, #CC9F0F 100%)
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
                <PlanText slug={slug} field="badge" />
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
                <PlanText slug={slug} field="title" />
              </Typography>
              <Typography
                variant="h5"
                sx={{ maxWidth: "760px", fontWeight: 400, lineHeight: 1.55, opacity: 0.95 }}
              >
                <PlanText slug={slug} field="intro" multiline />
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
                <PlanText slug={slug} field="ctaLabel" />
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
              { icon: Calendar, label: "Duración", field: "duration" as const },
              { icon: Smartphone, label: "Formato", field: "format" as const },
              { icon: DollarSign, label: "Inversión", field: "investment" as const },
            ].map(({ icon: Icon, label, field }) => (
              <Box key={label} sx={iconCardStyles}>
                <Icon color="var(--brand-gold)" size={34} />
                <Typography
                  variant="overline"
                  sx={{ display: "block", mt: 2, color: "#8a6b2b", fontWeight: 700 }}
                >
                  {label}
                </Typography>
                <Typography variant="h5" sx={{ color: "#1f2020", fontWeight: 800 }}>
                  <PlanText slug={slug} field={field} />
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ mb: { xs: 6, md: 9 }, textAlign: "center" }}>
            <Typography
              variant="overline"
              sx={{ color: "var(--brand-gold)", letterSpacing: "0.25rem", fontWeight: 800 }}
            >
              Programa
            </Typography>
            <Typography
              variant="h2"
              sx={{ color: "#1f2020", fontWeight: 800, fontSize: { xs: "2rem", md: "3.2rem" }, mb: 2 }}
            >
              ¿Qué vas a trabajar?
            </Typography>
            <Typography
              sx={{ maxWidth: "780px", mx: "auto", color: "#4a4a4a", fontSize: "1.15rem", lineHeight: 1.7 }}
            >
              <PlanText slug={slug} field="focus" multiline />
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
            {methodologyItems.map(({ icon: Icon, label, content }) => (
              <Box key={label} sx={{ ...iconCardStyles, backgroundColor: "#090708", color: "white" }}>
                <Icon color="var(--brand-gold-soft)" size={34} />
                <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 800 }}>
                  {label}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.65 }}>
                  {content}
                </Typography>
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
              <Typography
                variant="h3"
                sx={{ color: "#1f2020", fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.4rem" } }}
              >
                Extras incluidos
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: "24px 0 0", display: "grid", gap: 2 }}>
                {plan.extras.map((_, index) => (
                  <Box component="li" key={index} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <CheckCircle color="var(--brand-gold)" size={22} />
                    <Typography sx={{ color: "#333", lineHeight: 1.6 }}>
                      <PlanExtraText slug={slug} index={index} />
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {plan.benefits?.length ? (
              <Box sx={iconCardStyles}>
                <Typography
                  variant="h3"
                  sx={{ color: "#1f2020", fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.4rem" } }}
                >
                  Beneficios clave
                </Typography>
                <Box component="ul" sx={{ listStyle: "none", p: 0, m: "24px 0 0", display: "grid", gap: 2 }}>
                  {plan.benefits.map((_, index) => (
                    <Box component="li" key={index} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                      <Clock color="var(--brand-gold)" size={22} />
                      <Typography sx={{ color: "#333", lineHeight: 1.6 }}>
                        <PlanBenefitText slug={slug} index={index} />
                      </Typography>
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
                backgroundColor: "var(--brand-gold)",
                color: "white",
                borderRadius: "999px",
                px: 4,
                py: 1.4,
                fontWeight: 800,
                textTransform: "none",
                "&:hover": { backgroundColor: "#b98a2d" },
              }}
            >
              <PlanText slug={slug} field="ctaLabel" />
            </Button>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
};
