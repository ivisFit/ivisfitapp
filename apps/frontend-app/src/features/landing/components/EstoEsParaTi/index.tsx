"use client";

import { Box, Typography } from "@mui/material";
import { IoIosArrowRoundForward } from "react-icons/io";
import { useLandingContent } from "@/features/landing/cms/LandingContentProvider";
import { DEFAULT_HOME_DICTIONARY } from "@/features/landing/cms/home-dictionary";
import { HomeArrayText, HomeText } from "@/features/landing/cms/HomeCmsFields";
import { LandingSectionHeader } from "@/features/landing/components/shared/LandingSectionHeader";
import { landingSectionPaddingSx } from "@/features/landing/styles/landing-section";
import { getByPath } from "@/lib/preview-cms/lib/content-edit/paths";

export const EstoEsParaTi = () => {
  const { dictionary } = useLandingContent();
  const rawItems = getByPath(dictionary, "home.estoEsParaTi.items");
  const items =
    Array.isArray(rawItems) && rawItems.length > 0
      ? (rawItems as string[])
      : DEFAULT_HOME_DICTIONARY.home.estoEsParaTi.items;

  const renderItem = (index: number) => (
    <Box key={index} className="landing-list-item">
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          width: "38px",
          height: "38px",
          flexShrink: 0,
          mr: 1.75,
          pt: "3px",
        }}
      >
        <IoIosArrowRoundForward color="var(--brand-gold)" size="30px" />
      </Box>
      <Typography
        sx={{
          color: "#fff",
          fontSize: { md: "1.1rem", lg: "1.15rem" },
          lineHeight: 1.45,
          flex: 1,
          paddingTop: "6px",
        }}
      >
        <HomeArrayText path={`home.estoEsParaTi.items.${index}`} multiline />
      </Typography>
    </Box>
  );

  return (
    <Box
      component="section"
      className="landing-section landing-section--dark landing-section--accent-top"
      sx={{ position: "relative", overflow: "hidden" }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "5%",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "rgba(225, 170, 67, 0.05)",
          filter: "blur(10px)",
        }}
      />

      <Box
        sx={{
          width: "100%",
          display: { xs: "none", md: "flex" },
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
          ...landingSectionPaddingSx,
          py: { md: "4.25rem", lg: "5rem" },
        }}
      >
        <LandingSectionHeader
          centered
          tone="dark"
          eyebrow={<HomeText field="estoEsParaTi.eyebrow" />}
          title={<HomeText field="estoEsParaTi.title" />}
          sx={{ mb: { md: 3.5, lg: 4 } }}
        />

        <Box sx={{ width: "90%", maxWidth: "1150px" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: { md: 3, lg: 3.5 },
              alignItems: "start",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: { md: 2.25, lg: 2.5 } }}>
              {items.slice(0, 3).map((_, index) => renderItem(index))}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: { md: 2.25, lg: 2.5 } }}>
              {items.slice(3).map((_, index) => renderItem(index + 3))}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          backgroundColor: "var(--brand-dark)",
          display: { xs: "flex", md: "none" },
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          py: { xs: 4.5, sm: 5 },
          px: 2,
          position: "relative",
          zIndex: 1,
        }}
      >
        <LandingSectionHeader
          centered
          tone="dark"
          eyebrow={<HomeText field="estoEsParaTi.eyebrow" />}
          title={<HomeText field="estoEsParaTi.title" />}
          sx={{ mb: { xs: 3, sm: 3.5 } }}
        />

        <Box sx={{ width: "100%", maxWidth: "600px" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {items.map((_, index) => (
              <Box key={index} className="landing-list-item">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    width: "35px",
                    height: "35px",
                    flexShrink: 0,
                    mr: 2,
                    pt: "3px",
                  }}
                >
                  <IoIosArrowRoundForward color="var(--brand-gold)" size="28px" />
                </Box>
                <Typography
                  sx={{
                    color: "#fff",
                    fontSize: "0.9rem",
                    lineHeight: 1.4,
                    flex: 1,
                    paddingTop: "6px",
                  }}
                >
                  <HomeArrayText path={`home.estoEsParaTi.items.${index}`} multiline />
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
