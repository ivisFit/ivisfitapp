import React, { useState } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Check } from "lucide-react";
import { plans } from "../../data/plans";

const TrainingAccordionGroup = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      {plans.map((plan, index) => {
        const panelId = `panel${index + 1}`;
        const isOpen = expanded === panelId;
        const meta = [
          { label: "Duraci\u00f3n", value: plan.duration },
          { label: "Formato", value: plan.format },
          { label: "Inversi\u00f3n", value: plan.investment },
        ];

        return (
          <Accordion
            key={plan.id}
            expanded={isOpen}
            onChange={handleChange(panelId)}
            disableGutters
            elevation={0}
            sx={{
              backgroundColor: isOpen ? "#121010" : "rgba(255,255,255,0.02)",
              border: isOpen
                ? "1px solid rgba(253, 201, 21, 0.55)"
                : "1px solid rgba(253, 201, 21, 0.16)",
              borderRadius: "14px !important",
              overflow: "hidden",
              transition: "border-color 0.3s ease, background-color 0.3s ease",
              "&:before": { display: "none" },
              "&:hover": {
                borderColor: "rgba(253, 201, 21, 0.4)",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#fdc915" }} />}
              aria-controls={`${panelId}-content`}
              id={`${panelId}-header`}
              sx={{ px: { xs: "1rem", md: "1.4rem" }, py: "0.4rem" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.9rem",
                  width: "100%",
                  pr: "0.5rem",
                }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    color: isOpen ? "#1f1402" : "#fdc915",
                    backgroundColor: isOpen ? "#fdc915" : "rgba(253,201,21,0.12)",
                    border: "1px solid rgba(253,201,21,0.5)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: { xs: "1rem", md: "1.15rem" },
                      lineHeight: 1.2,
                    }}
                  >
                    {plan.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#fdc915",
                      fontSize: "0.78rem",
                      letterSpacing: "0.05rem",
                      mt: "2px",
                    }}
                  >
                    {plan.duration}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                px: { xs: "1rem", md: "1.4rem" },
                pb: "1.4rem",
                pt: 0,
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "0.92rem",
                  lineHeight: 1.65,
                  mt: "1rem",
                }}
              >
                {plan.intro}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.6rem",
                  mt: "1.1rem",
                }}
              >
                {meta.map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      px: "0.9rem",
                      py: "0.5rem",
                      borderRadius: "10px",
                      backgroundColor: "rgba(253,201,21,0.08)",
                      border: "1px solid rgba(253,201,21,0.18)",
                      minWidth: "92px",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.08rem",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography sx={{ color: "#fdc915", fontWeight: 700, fontSize: "0.88rem" }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                component="ul"
                sx={{
                  listStyle: "none",
                  p: 0,
                  m: "1.2rem 0 0",
                  display: "grid",
                  gap: "0.6rem",
                }}
              >
                {plan.extras.map((extra) => (
                  <Box
                    component="li"
                    key={extra}
                    sx={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}
                  >
                    <Check size={18} color="#fdc915" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <Typography sx={{ color: "rgba(255,255,255,0.82)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                      {extra}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default TrainingAccordionGroup;
