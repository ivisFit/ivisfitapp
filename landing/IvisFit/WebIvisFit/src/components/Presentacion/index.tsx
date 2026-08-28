import { Box, Typography } from "@mui/material"
import { ButtonPresentation } from "../Buttons/ButtonPresentation"
import { ButtonPresentation2 } from "../Buttons/ButtonPresentation2"
import { useState, useLayoutEffect, useRef } from "react"

const imagenPresentacion = "/imgs/Presentacion.JPG";

export const Presentacion = () => {
  const [textContainerHeight, setTextContainerHeight] = useState<string>('auto')
  const textContainerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = textContainerRef.current
    if (!el) return

    const updateHeight = () => {
      // Usamos scrollHeight para obtener la altura completa del contenido
      setTextContainerHeight(`${el.scrollHeight}px`)
    }

    // Medimos al montar
    updateHeight()

    // Observador para cambios en el contenido
    const ro = new ResizeObserver(() => {
      updateHeight()
    })
    ro.observe(el)

    // Fallback en resize de ventana
    window.addEventListener('resize', updateHeight)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  return (
    <Box sx={{ width: '100%' }} id="conoceme-section">

      {/* Versión para pantallas medianas y grandes */}
      <Box sx={{
        width: '100%',
        display: { xs: 'none', sm: 'flex' },
        alignItems: 'stretch',
        padding: 0
      }}>
        {/* Contenedor de imagen - altura sincronizada con el contenido de texto */}
        <Box sx={{
          width: '50%',
          height: textContainerHeight,
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative'
        }}>
          <img
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top', // Esto recortará desde la parte superior
              display: 'block'
            }}
            src={imagenPresentacion}
            alt="Ivis Fernández - Profesora de Educación Física"
          />
        </Box>

        {/* Contenedor de texto - referencia para la altura */}
        <Box
          ref={textContainerRef}
          sx={{
            width: '50%',
            padding: { xs: '2rem', lg: '3rem' },
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible'
          }}
        >
          <h2 style={{
            letterSpacing: '1rem',
            fontSize: '20px',
            marginTop: '0',
            marginBottom: '0.5rem'
          }}>
            HOLA
          </h2>

          <Typography sx={{
            padding: { xs: '0', lg: '0 0 0.5rem 0' },
            fontSize: { xs: '2.5rem', lg: '3.5rem' },
            fontFamily: 'Poppins',
            fontWeight: '600',
            color: '#e1aa43',
            lineHeight: '1.1'
          }}
          >
            Soy Ivis
          </Typography>

          <Box sx={{ width: '70px', height: '4px', borderRadius: '999px', backgroundColor: '#e1aa43', mb: 2 }} />

          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
            py: 1
          }}>
            <Typography sx={{
              letterSpacing: '0.05rem',
              fontSize: { xs: '0.9rem', lg: '1.1rem' },
              lineHeight: '1.7',
              fontFamily: 'Poppins',
              fontWeight: '400',
              color: '#000000',
              overflow: 'visible',
              '& br': {
                display: { xs: 'none', md: 'block' }
              }
            }}>
              Hola, soy Ivis Fernández: entrenadora personal con formación en educación física, musculación y nutrición deportiva.
              <br /><br />
              Mi misión es ayudarte a alcanzar tu mejor versión con un seguimiento <span style={{ color: '#e1aa43' }}>100% personalizado</span>, transformando vidas a través del deporte y la disciplina.
              <br /><br />
              Soy especialista en musculación femenina con enfoque en recomposición corporal. Trabajo para que cada entrenamiento tenga intención, técnica y una progresión real según tus objetivos.
              <br /><br />
              En Ivis Fit no se trata de entrenar por obligación: se trata de construir hábitos, fuerza, confianza y una relación más consciente con tu cuerpo.
              <br /><br />
              <span style={{ color: '#e1aa43', fontWeight: 700 }}># ENTRENA CON PROPÓSITO 2026</span>
            </Typography>

            <Box sx={{
              padding: '1.5rem 0 0 0',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              flexShrink: 0
            }}>
              <a href="#planes-section" style={{ textDecoration: "none", color: "white" }}>
                <ButtonPresentation />
              </a>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Versión para móviles (sin cambios) */}
      <Box sx={{
        width: '100%',
        display: { xs: 'flex', sm: 'none' },
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box'
      }}>
        {/* Imagen en versión móvil */}
        <Box sx={{
          width: '100%',
          height: { xs: '50vh', sm: '60vh' },
          overflow: 'hidden'
        }}>
          <img
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block'
            }}
            src={imagenPresentacion}
            alt="Ivis Fernández - Profesora de Educación Física"
          />
        </Box>

        {/* Contenido en versión móvil */}
        <Box sx={{
          width: '100%',
          padding: '2rem',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <h2 style={{
            letterSpacing: '1rem',
            fontSize: '18px',
            marginTop: '0',
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            HOLA
          </h2>

          <Typography sx={{
            padding: '0',
            fontSize: '2.5rem',
            fontFamily: 'Poppins',
            fontWeight: '600',
            color: '#e1aa43',
            textAlign: 'center',
            lineHeight: '1.1'
          }}>
            Soy Ivis
          </Typography>

          <Box sx={{ width: '70px', height: '4px', borderRadius: '999px', backgroundColor: '#e1aa43', margin: '0.8rem auto 0' }} />

          <Typography sx={{
            letterSpacing: '0.03rem',
            fontSize: '0.9rem',
            lineHeight: '1.7',
            fontFamily: 'Poppins',
            fontWeight: '400',
            color: '#000000',
            marginTop: '1rem'
          }}>
            Hola, soy Ivis Fernández: entrenadora personal con formación en educación física, musculación y nutrición deportiva.
            <br /><br />
            Mi misión es ayudarte a alcanzar tu mejor versión con un seguimiento <span style={{ color: '#e1aa43' }}>100% personalizado</span>, transformando vidas a través del deporte y la disciplina.
            <br /><br />
            Soy especialista en musculación femenina con enfoque en recomposición corporal. Trabajo para que cada entrenamiento tenga intención, técnica y una progresión real según tus objetivos.
            <br /><br />
            En Ivis Fit no se trata de entrenar por obligación: se trata de construir hábitos, fuerza, confianza y una relación más consciente con tu cuerpo.
            <br /><br />
            <span style={{ color: '#e1aa43', fontWeight: 700 }}># ENTRENA CON PROPÓSITO 2026</span>
          </Typography>

          <Box sx={{
            padding: '2rem 0 0 0',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'end'
          }}>
            <a href="#planes-section" style={{ textDecoration: "none", color: "white" }}>
              <ButtonPresentation2 />
            </a>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}