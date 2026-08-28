"use client";

import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import Scrollbar from "smooth-scrollbar";
import type { Plan } from "@/features/landing/data/plans";
import { Navbar } from "@/features/landing/components/Navbar";
import { VideoFondo } from "@/features/landing/components/VideoFondo";
import { ButtonArrow } from "@/features/landing/components/Buttons/ButtonArrow";
import { Presentacion } from "@/features/landing/components/Presentacion";
import { ButtonPresentationTransparent } from "@/features/landing/components/Buttons/ButtonPresentationTransparent";
import { HeroAppPromo } from "@/features/landing/components/HeroAppPromo";
import { ButtonArrowOscuro } from "@/features/landing/components/Buttons/ButtonArrowOscuro";
import { HomeText } from "@/features/landing/cms/HomeCmsFields";
import { useContent } from "@/lib/preview-cms/lib/content-edit/useContent";
import { useEditOptional } from "@/lib/preview-cms/lib/content-edit/EditProvider";

const Prices = dynamic(
  () => import("@/features/landing/components/Prices").then((mod) => mod.Prices),
  { ssr: false },
);
const PlanTotal = dynamic(
  () => import("@/features/landing/components/PlanTotal").then((mod) => mod.PlanTotal),
  { ssr: false },
);
const PlanTotal2 = dynamic(
  () => import("@/features/landing/components/PlanTotal2").then((mod) => mod.PlanTotal2),
  { ssr: false },
);
const Transformaciones = dynamic(
  () => import("@/features/landing/components/Transformaciones").then((mod) => mod.Transformaciones),
  { ssr: false },
);
const Transformaciones2 = dynamic(
  () => import("@/features/landing/components/Transformaciones2").then((mod) => mod.Transformaciones2),
  { ssr: false },
);
const Transformaciones3 = dynamic(
  () => import("@/features/landing/components/Transformaciones3").then((mod) => mod.Transformaciones3),
  { ssr: false },
);
const Separador = dynamic(
  () => import("@/features/landing/components/Separador"),
  { ssr: false },
);
const IncluyenPlanes = dynamic(
  () => import("@/features/landing/components/IncluyenPlanes").then((mod) => mod.IncluyenPlanes),
  { ssr: false },
);
const NutricionAMedida = dynamic(
  () => import("@/features/landing/components/NutricionAMedida").then((mod) => mod.NutricionAMedida),
  { ssr: false },
);
const Testimonios = dynamic(
  () => import("@/features/landing/components/Testimonios").then((mod) => mod.Testimonios),
  { ssr: false },
);
const EstoEsParaTi = dynamic(
  () => import("@/features/landing/components/EstoEsParaTi").then((mod) => mod.EstoEsParaTi),
  { ssr: false },
);
const PreguntasFrecuentes = dynamic(
  () => import("@/features/landing/components/Preguntasfrecuentes").then((mod) => mod.PreguntasFrecuentes),
  { ssr: false },
);
const Contacto = dynamic(
  () => import("@/features/landing/components/Contacto").then((mod) => mod.Contacto),
  { ssr: false },
);
const Contacto2 = dynamic(
  () => import("@/features/landing/components/Contacto2").then((mod) => mod.Contacto2),
  { ssr: false },
);
const SliderScroll = dynamic(
  () => import("@/features/landing/components/SliderScroll").then((mod) => mod.SliderScroll),
  { ssr: false },
);
const Footer = dynamic(
  () => import("@/features/landing/components/Footer").then((mod) => mod.Footer),
  { ssr: false },
);

type LandingHomePageProps = {
  plans: Plan[];
  previewSection?: "planes";
};

export function LandingHomePage({ plans, previewSection }: LandingHomePageProps) {
  const { text } = useContent();
  const editCtx = useEditOptional();
  const isPreview = editCtx?.suppressNavigation === true;
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollbarRef = useRef<Scrollbar | null>(null);
  const onlinePlan = plans.find((plan) => plan.id === "online");

  useEffect(() => {
    if (previewSection !== "planes") return;
    const target = document.getElementById("planes-section");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [previewSection]);

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const useScrollRoot =
      !isPreview &&
      window.matchMedia("(min-width: 600px)").matches;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ivis-in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px",
        root: useScrollRoot ? root : null,
      },
    );

    const tagSections = () => {
      root.querySelectorAll("section:not(.ivis-reveal)").forEach((section) => {
        section.classList.add("ivis-reveal");
        revealObserver.observe(section);
      });
    };

    tagSections();

    const mutationObserver = new MutationObserver(tagSections);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      revealObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [isPreview]);

  useEffect(() => {
    if (isPreview) return;

    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;
    };

    if (isMobileDevice()) {
      return;
    }

    if (!scrollContainerRef.current) return;

    try {
      const scrollbar = Scrollbar.init(scrollContainerRef.current, {
        damping: 0.05,
        thumbMinSize: 20,
        renderByPixels: true,
      });

      scrollbarRef.current = scrollbar;

      const handleAnchorClick = (e: MouseEvent) => {
        const target = e.target instanceof Element ? e.target : null;
        const link = target?.closest('a[href^="#"]');
        if (link) {
          e.preventDefault();
          const href = link.getAttribute('href');
          if (href) {
            scrollToSection(href.substring(1));
          }
        }
      };

      document.addEventListener('click', handleAnchorClick);

      return () => {
        document.removeEventListener('click', handleAnchorClick);
        if (scrollbarRef.current) {
          scrollbarRef.current.destroy();
        }
      };
    } catch (error) {
      console.warn('Error initializing smooth-scrollbar:', error);
      return undefined;
    }
  }, [isPreview]);

  const scrollToSection = (sectionId: string) => {
    if (!scrollbarRef.current) {
      const targetElement = document.getElementById(sectionId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
      return;
    }

    const targetElement = document.getElementById(sectionId);
    if (targetElement && scrollbarRef.current) {
      scrollbarRef.current.scrollIntoView(targetElement, {
        offsetTop: -80,
      });
    }
  };

  return (
    <Box sx={{ 
      width: "100%", 
      height: isPreview ? "auto" : { xs: "auto", sm: "100vh" },
      display: "flex", 
      flexDirection: "column" 
    }}>
      <Navbar />
      
      <Box sx={{ 
        flexShrink: 0,
        display: { xs: "block", sm: "none" }, 
        height: "80px" 
      }} />

      <Box
        sx={{
          flexShrink: 0,
          display: { xs: "none", sm: "block" },
          height: "120px",
        }}
      />
      
      <Box 
        ref={scrollContainerRef} 
        sx={{ 
          flex: isPreview ? 0 : { xs: 0, sm: 1 }, 
          width: "100%",
          minHeight: isPreview ? "auto" : { xs: "auto", sm: 0 },
          overflow: isPreview
            ? "visible"
            : {
                xs: "visible", 
                sm: "hidden"  
              },
          height: isPreview ? "auto" : { xs: "auto", sm: "100%" }
        }}
      >
        <Box sx={{ 
          width: "100%", 
          height: { xs: "auto", sm: "auto" },
          boxSizing: "border-box",
          position: { xs: "static", sm: "relative" }
        }}>
          <Box sx={{ position: "relative", width: "100%", minHeight: { xs: "auto", sm: "calc(100vh - 120px)" } }}>
            <VideoFondo variant={isPreview ? "preview" : "default"} />
            
            <Box sx={{ 
              minHeight: { xs: "auto", sm: "calc(100vh - 120px)" },
              position: "absolute", 
              top: "0", 
              zIndex: "1", 
              width: "100%", 
              display: { xs: "none", sm: "flex" }, 
              alignItems: "center", 
              justifyContent: "space-between",
              boxSizing: "border-box",
              paddingTop: { sm: "1.5rem", lg: "1rem" },
              paddingBottom: { sm: "2rem", lg: "2.5rem" },
            }}>
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                flexDirection: "column", 
                width: "50%",
                boxSizing: "border-box",
                minWidth: 0,
              }}>
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  width: "40vw", 
                  maxWidth: "34rem",
                  gap: "1.5rem",
                  padding: "0 5vw",
                  boxSizing: "border-box",
                }}>
                  <Box component="p" className="landing-hero-eyebrow ivis-fade-up" sx={{ margin: 0 }}>
                    {text("home.hero.eyebrow") || "Coaching online personalizado"}
                  </Box>
                  <Box component="h1" sx={{
                    color: "white",
                    fontSize: { sm: "2.9rem", md: "3.5rem", lg: "4.1rem" },
                    fontWeight: 400,
                    textTransform: "uppercase",
                    margin: 0,
                    lineHeight: 1.04,
                    letterSpacing: "0.02em",
                    textShadow: "0 6px 30px rgba(0,0,0,0.45)",
                  }} className="oswald-fuente ivis-fade-up">
                    <HomeText field="hero.titleLine1" as="span" />
                    <br />
                    <Box component="span" className="landing-hero-accent">
                      <HomeText field="hero.titleLine2" as="span" />
                    </Box>
                  </Box>
                  <Box sx={{ 
                    display: "flex", 
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    alignItems: "center",
                    marginTop: "0.5rem", 
                    gap: "1rem",
                  }} className="ivis-fade-up-delay-2">
                    <a href="#planes-section" className="landing-cta-link" aria-label="Ver planes de entrenamiento">
                      <ButtonArrow text={text("home.hero.ctaPrimary") || "Ver planes"} />
                    </a>
                    <a href="#conoceme-section" className="landing-cta-link" aria-label="Conocer a la profe">
                      <ButtonArrowOscuro text={text("home.hero.ctaSecondary") || "Conóceme"} />
                    </a>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  width: "50%",
                  boxSizing: "border-box",
                  minWidth: 0,
                }}
              >
                <HeroAppPromo />
              </Box>

              <Box
                component="a"
                href="#planes-section"
                className="landing-scroll-cue ivis-scroll-cue"
                aria-label="Ir a la sección de planes"
                sx={{ display: { xs: "none", sm: "inline-flex" } }}
              >
                <Box component="span">Deslizá</Box>
                <Box component="span" className="landing-scroll-cue__chevron" aria-hidden />
              </Box>
            </Box>
            
            <Box sx={{ 
              position: "absolute", 
              top: "0", 
              zIndex: "1", 
              width: "100%", 
              minHeight: { xs: "calc(100vh - 80px)", sm: "auto" },
              display: { xs: "flex", sm: "none" }, 
              alignItems: "center", 
              justifyContent: "center",
              boxSizing: "border-box",
              paddingTop: "1.25rem",
              paddingBottom: "2rem",
            }}>
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                flexDirection: "column",
                width: "100%",
                boxSizing: "border-box",
              }}>
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  width: "100%", 
                  gap: "1.2rem",
                  alignItems: "center",
                  padding: "0 1.5rem",
                  boxSizing: "border-box",
                }}>
                  <Box
                    component="p"
                    className="landing-hero-eyebrow ivis-fade-up"
                    sx={{ margin: 0, justifyContent: "center" }}
                  >
                    {text("home.hero.eyebrow") || "Coaching online personalizado"}
                  </Box>
                  <Box
                    component="h1"
                    className="oswald-fuente ivis-fade-up"
                    sx={{
                      color: "white",
                      fontSize: "clamp(2.2rem, 9vw, 2.8rem)",
                      fontWeight: 400,
                      textTransform: "uppercase",
                      lineHeight: 1.08,
                      letterSpacing: "0.03em",
                      textAlign: "center",
                      margin: 0,
                      textShadow: "0 6px 30px rgba(0,0,0,0.45)",
                    }}
                  >
                    <HomeText field="hero.titleLine1" as="span" />{" "}
                    <Box component="span" className="landing-hero-accent">
                      <HomeText field="hero.titleLine2" as="span" />
                    </Box>
                  </Box>
                  <Box sx={{ 
                    width: "100%", 
                    display: "flex", 
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "0.75rem",
                    marginTop: "1rem"
                  }} className="ivis-fade-up-delay-2">
                    <a href="#planes-section" className="landing-cta-link" aria-label="Ver planes de entrenamiento">
                      <ButtonPresentationTransparent />
                    </a>
                    <a href="#conoceme-section" className="landing-cta-link" aria-label="Conocer a la profe">
                      <ButtonArrowOscuro text={text("home.hero.ctaSecondary") || "Conóceme"} />
                    </a>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ position: "relative", zIndex: 2 }}>
            <Prices />
            {onlinePlan ? <PlanTotal onlinePlan={onlinePlan} /> : null}
            {onlinePlan ? <PlanTotal2 onlinePlan={onlinePlan} /> : null}
            <Transformaciones />
            <Transformaciones2 />
            <Transformaciones3 />
            <Separador textKey="transformacion" />
            <Presentacion />
            <IncluyenPlanes plans={plans} />
            <NutricionAMedida /> 
            <Testimonios />
            <Separador textKey="camino" />
            <EstoEsParaTi />
            <PreguntasFrecuentes />
            <Contacto />
            <Contacto2 />
            <SliderScroll />
            <Footer />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
