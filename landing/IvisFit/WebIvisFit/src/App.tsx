import { Box } from "@mui/material"
import { Navbar } from "./components/Navbar"
import {VideoFondo} from "./components/VideoFondo"
import { ButtonArrow } from "./components/Buttons/ButtonArrow";
import { Prices } from "./components/Prices";
import { PlanTotal } from "./components/PlanTotal";
import { Transformaciones } from "./components/Transformaciones";
import { Presentacion } from "./components/Presentacion";
import Separador from "./components/Separador";
import { IncluyenPlanes } from "./components/IncluyenPlanes";
import { NutricionAMedida } from "./components/NutricionAMedida";
import { Testimonios } from "./components/Testimonios";
import { EstoEsParaTi } from "./components/EstoEsParaTi";
import { PreguntasFrecuentes } from "./components/Preguntasfrecuentes";
import { Contacto } from "./components/Contacto";
import { SliderScroll } from "./components/SliderScroll";
import { Footer } from "./components/Footer";
import { PlanTotal2 } from "./components/PlanTotal2";
import { Transformaciones2 } from "./components/Transformaciones2";
import { Contacto2 } from "./components/Contacto2";
import { ButtonPresentationTransparent } from "./components/Buttons/ButtonPresentationTransparent";
import { Transformaciones3 } from "./components/Transformaciones3";
import Separador2 from "./components/Separador2";
import { ButtonArrowOscuro } from "./components/Buttons/ButtonArrowOscuro";
import { useEffect, useRef } from "react";
import Scrollbar from 'smooth-scrollbar';

function App() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollbarRef = useRef<Scrollbar | null>(null);

  useEffect(() => {
    // Detecta si el dispositivo es movil
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;
    };

    // En movil no inicializamos smooth-scrollbar (usamos scroll nativo)
    if (isMobileDevice()) {
      return;
    }

    // Solo inicializar smooth-scrollbar si NO es movil
    if (!scrollContainerRef.current) return;

    try {
      const scrollbar = Scrollbar.init(scrollContainerRef.current, {
        damping: 0.05,
        thumbMinSize: 20,
        renderByPixels: true,
      });

      scrollbarRef.current = scrollbar;

      // Manejar clicks en anchors internos
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
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    // Si no hay scrollbar (movil), usar scroll nativo
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

    // Si hay scrollbar, usar smooth-scrollbar
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
      height: { xs: "auto", sm: "100vh" },
      display: "flex", 
      flexDirection: "column" 
    }}>
      {/* Navbar fija externa */}
      <Navbar />
      
      <Box sx={{ 
        flexShrink: 0,
        display: { xs: "block", sm: "none" }, 
        height: "80px" 
      }} />
      
      {/* Contenedor principal */}
      <Box 
        ref={scrollContainerRef} 
        sx={{ 
          flex: { xs: 0, sm: 1 }, 
          width: "100%",
          overflow: {
            xs: "visible", 
            sm: "hidden"  
          },
          height: { xs: "auto", sm: "100%" }
        }}
      >
        {/* Contenido principal */}
        <Box sx={{ 
          width: "100%", 
          height: { xs: "auto", sm: "auto" },
          boxSizing: "border-box",
          position: { xs: "static", sm: "relative" }
        }}>
          {/* Seccion hero con video */}
          <Box sx={{ position: "relative", width: "100%" }}>
            <VideoFondo />
            
            {/* Contenido desktop sobre el video */}
            <Box sx={{ 
              minHeight: "600px",
              position: "absolute", 
              top: "0", 
              zIndex: "1", 
              width: "100%", 
              height: "100vh", 
              display: { xs: "none", sm: "flex" }, 
              alignItems: "center", 
              justifyContent: "space-between",
              boxSizing: "border-box",
              paddingTop: { sm: "130px", lg: "110px" },
            }}>
              <Box sx={{ 
                height: "100vh", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                flexDirection: "column", 
                width: "50%",
                boxSizing: "border-box"
              }}>
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  width: "40vw", 
                  marginTop: "2rem", 
                  gap: "1.5rem", 
                  padding: "0 5vw"
                }}>
                  <Box
                    className="ivis-fade-up"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                      color: "#e1aa43",
                      letterSpacing: "0.45rem",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    <Box sx={{ width: "42px", height: "2px", backgroundColor: "#e1aa43" }} />
                    {"Ivis Fit \u00B7 Entrenamiento femenino"}
                  </Box>
                  <Box component="h1" sx={{ 
                    color: "white", 
                    fontSize: { md: "3.6rem", lg: "4.4rem" }, 
                    margin: 0,
                    lineHeight: 1.05, 
                    letterSpacing: "0.4rem",
                    textShadow: "0 6px 30px rgba(0,0,0,0.45)",
                  }} className="oswald-fuente ivis-fade-up">
                    {"ENTRENA CON"}<br />{"PROP\u00D3SITO 2026"}
                  </Box>
                  <Box
                    component="p"
                    className="ivis-fade-up-delay"
                    sx={{
                      color: "rgba(255,255,255,0.86)",
                      fontFamily: "Poppins",
                      fontSize: "1.1rem",
                      lineHeight: 1.7,
                      maxWidth: "30rem",
                      margin: 0,
                    }}
                  >
                    {"Seguimiento 100% personalizado para transformar tu cuerpo a trav\u00E9s del deporte y la disciplina. Especialista en musculaci\u00F3n femenina y recomposici\u00F3n corporal."}
                  </Box>
                  <Box sx={{ 
                    display: "flex", 
                    marginTop: "0.5rem", 
                    gap: "1rem",
                    flexWrap: "wrap",
                  }} className="ivis-fade-up-delay-2">
                    <a href="#planes-section" style={{ textDecoration: "none" }}>
                      <ButtonArrow text="Ver planes" />
                    </a>
                    <a href="#conoceme-section" style={{ textDecoration: "none" }}>
                      <ButtonArrowOscuro text={"Con\u00F3ceme"}/>
                    </a>
                  </Box>
                </Box>
              </Box>
            </Box>
            
            {/* Contenido movil sobre el video */}
            <Box sx={{ 
              position: "absolute", 
              top: "0", 
              zIndex: "1", 
              width: "100%", 
              height: "100vh", 
              display: { xs: "flex", sm: "none" }, 
              alignItems: "center", 
              justifyContent: "center",
              boxSizing: "border-box"
            }}>
              <Box sx={{ 
                height: "100vh", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                flexDirection: "column",
                boxSizing: "border-box"
              }}>
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  width: "100%", 
                  marginTop: "2rem", 
                  gap: "1.2rem",
                  alignItems: "center",
                  padding: "0 1.5rem",
                  boxSizing: "border-box",
                }}>
                  <Box
                    className="ivis-fade-up"
                    sx={{
                      color: "#e1aa43",
                      letterSpacing: "0.35rem",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      textAlign: "center",
                    }}
                  >
                    {"Ivis Fit \u00B7 Entrenamiento femenino"}
                  </Box>
                  <h1 style={{ 
                    color: "white", 
                    fontSize: "3.2rem",
                    fontWeight: "500", 
                    lineHeight: "3.3rem", 
                    letterSpacing: "0.4rem", 
                    textAlign: "center", 
                    margin: 0,
                    textShadow: "0 6px 30px rgba(0,0,0,0.45)",
                  }} className="oswald-fuente ivis-fade-up">
                    {"ENTRENA CON PROP\u00D3SITO 2026"}
                  </h1>
                  <Box
                    component="p"
                    className="ivis-fade-up-delay"
                    sx={{
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: "Poppins",
                      fontSize: "0.98rem",
                      lineHeight: 1.6,
                      textAlign: "center",
                      maxWidth: "22rem",
                      margin: 0,
                    }}
                  >
                    Seguimiento 100% personalizado para transformar tu cuerpo con disciplina y constancia.
                  </Box>
                  <Box sx={{ 
                    width: "100%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    marginTop: "1rem"
                  }} className="ivis-fade-up-delay-2">
                    <a href="#planes-section">
                      <ButtonPresentationTransparent />
                    </a>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          
          {/* Resto del contenido, fuera del contenedor absoluto del hero */}
          <Box sx={{ position: "relative", zIndex: 2 }}>
            <Prices />
            <PlanTotal />
            <PlanTotal2 />
            <Transformaciones />
            <Transformaciones2 />
            <Transformaciones3 />
            <Separador text={"Comienza tu transformaci\u00F3n hoy mismo"}/>
            <Presentacion />
            <IncluyenPlanes />
            <NutricionAMedida /> 
            <Testimonios />
            <Box sx={{ display: { xs: "none", smmd: "flex" } }}>
              <Separador text="Comencemos este camino juntas"/>
            </Box>
            <Box sx={{ display: { xs: "flex", smmd: "none" } }}>
              <Separador2 />
            </Box>
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

export default App
