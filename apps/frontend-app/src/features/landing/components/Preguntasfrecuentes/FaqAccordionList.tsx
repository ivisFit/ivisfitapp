"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLandingContent } from "@/features/landing/cms/LandingContentProvider";
import { DEFAULT_HOME_DICTIONARY, type FaqItem } from "@/features/landing/cms/home-dictionary";
import { HomeArrayText } from "@/features/landing/cms/HomeCmsFields";
import { getByPath } from "@/lib/preview-cms/lib/content-edit/paths";
import { landingColors } from "@/features/landing/styles/landing-colors";

type FaqAccordionListProps = {
  start?: number;
  end?: number;
  compact?: boolean;
};

function getFaqItems(dictionary: Record<string, unknown>): FaqItem[] {
  const items = getByPath(dictionary, "home.faq.items");
  if (Array.isArray(items) && items.length > 0) {
    return items as FaqItem[];
  }
  return DEFAULT_HOME_DICTIONARY.home.faq.items;
}

export function FaqAccordionList({ start = 0, end, compact = false }: FaqAccordionListProps) {
  const { dictionary } = useLandingContent();
  const allItems = getFaqItems(dictionary);
  const items = allItems.slice(start, end);
  const [expanded, setExpanded] = useState<string[]>([]);

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded((current) =>
        isExpanded ? [...current, panel] : current.filter((id) => id !== panel),
      );
    };

  return (
    <Box className="landing-faq-accordion" sx={{ width: "100%", height: "100%" }}>
      {items.map((accordion, index) => {
        const globalIndex = start + index;
        const panelId = `faq-panel-${globalIndex}`;

        return (
          <Accordion
            key={panelId}
            expanded={expanded.includes(panelId)}
            onChange={handleChange(panelId)}
            disableGutters
            elevation={0}
            sx={{
              backgroundColor: landingColors.white,
              borderBottom:
                index !== items.length - 1
                  ? "1px solid rgb(225 170 67 / 28%)"
                  : "none",
              boxShadow: "none",
              "&:before": { display: "none" },
              transition: "background-color 0.2s ease",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon aria-hidden />}
              aria-controls={`${panelId}-content`}
              id={`${panelId}-header`}
              sx={{
                "& .MuiSvgIcon-root": { color: "var(--brand-gold-soft)" },
                padding: compact ? "10px 0" : undefined,
                minHeight: 56,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  minHeight: compact ? "auto" : 48,
                  padding: compact ? 0 : "0.5rem 0",
                }}
              >
                <Typography
                  component="h3"
                  sx={{
                    color: landingColors.textBody,
                    fontSize: compact ? "1.05rem" : "clamp(1rem, 2.2vh, 1.2rem)",
                    fontWeight: 700,
                    lineHeight: 1.35,
                    margin: 0,
                  }}
                >
                  <HomeArrayText path={`home.faq.items.${globalIndex}.question`} />
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails id={`${panelId}-content`} role="region" aria-labelledby={`${panelId}-header`}>
              <Typography component="p" sx={{ margin: 0, lineHeight: 1.65, color: "var(--landing-body-muted)" }}>
                <HomeArrayText path={`home.faq.items.${globalIndex}.answer`} multiline />
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
