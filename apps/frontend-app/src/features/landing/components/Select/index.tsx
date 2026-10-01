"use client";

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
import type { Plan } from "../../data/plans";
import {
  CmsArrayAddButton,
  CmsArrayControlsRow,
  CmsArrayRemoveButton,
} from "@/features/landing/cms/CmsArrayControls";
import { CmsIncluyenPlanRemoveButton } from "@/features/landing/cms/CmsIncluyenPlanesPlanControls";
import { T } from "@/lib/preview-cms/lib/content-edit/T";

type TrainingAccordionGroupProps = {
  plans: Plan[];
};

const EXTRA_ITEM_TEMPLATE = "Nuevo beneficio";

function planPath(planId: string, field: string) {
  return `planes.bySlug.${planId}.${field}`;
}

const TrainingAccordionGroup = ({ plans }: TrainingAccordionGroupProps) => {
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
        const extrasPath = planPath(plan.id, "extras");
        const extras = plan.extras ?? [];
        const meta = [
          { label: "Duraci\u00f3n", path: planPath(plan.id, "duration") },
          { label: "Formato", path: planPath(plan.id, "format") },
          { label: "Inversi\u00f3n", path: planPath(plan.id, "investment") },
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
              expandIcon={<ExpandMoreIcon sx={{ color: "var(--brand-gold-soft)" }} />}
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
                    color: isOpen ? "#1f1402" : "var(--brand-gold-soft)",
                    backgroundColor: isOpen ? "var(--brand-gold-soft)" : "rgba(253,201,21,0.12)",
                    border: "1px solid rgba(253,201,21,0.5)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                  <Typography
                    component="div"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: { xs: "1rem", md: "1.15rem" },
                      lineHeight: 1.2,
                    }}
                  >
                    <T path={planPath(plan.id, "title")} />
                  </Typography>
                  <Typography
                    component="div"
                    sx={{
                      color: "var(--brand-gold-soft)",
                      fontSize: "0.78rem",
                      letterSpacing: "0.05rem",
                      mt: "2px",
                    }}
                  >
                    <T path={planPath(plan.id, "duration")} />
                  </Typography>
                </Box>
                <CmsIncluyenPlanRemoveButton index={index} />
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
                component="div"
                sx={{
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "0.92rem",
                  lineHeight: 1.65,
                  mt: "1rem",
                }}
              >
                <T path={planPath(plan.id, "intro")} multiline />
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
                    <Typography
                      component="div"
                      sx={{ color: "var(--brand-gold-soft)", fontWeight: 700, fontSize: "0.88rem" }}
                    >
                      <T path={item.path} />
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
                {extras.map((extra, extraIndex) => (
                  <Box
                    component="li"
                    key={`${plan.id}-extra-${extraIndex}-${extra.slice(0, 12)}`}
                    sx={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}
                  >
                    <Check size={18} color="var(--brand-gold-soft)" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <CmsArrayControlsRow>
                      <Typography
                        component="div"
                        sx={{ color: "rgba(255,255,255,0.82)", fontSize: "0.9rem", lineHeight: 1.5 }}
                      >
                        <T path={`${extrasPath}.${extraIndex}`} />
                      </Typography>
                      <CmsArrayRemoveButton
                        arrayPath={extrasPath}
                        index={extraIndex}
                        arrayLength={extras.length}
                        minItems={0}
                      />
                    </CmsArrayControlsRow>
                  </Box>
                ))}
              </Box>

              <CmsArrayAddButton
                arrayPath={extrasPath}
                template={EXTRA_ITEM_TEMPLATE}
                label="Agregar beneficio"
              />
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default TrainingAccordionGroup;
