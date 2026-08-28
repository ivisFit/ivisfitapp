import React, { useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const AccordionFAQ = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Datos para los acordeones con las preguntas y respuestas reales
  const accordions = [
    { 
      id: 'panel1', 
      question: '¿En qué consisten los programas de Ivis Fit?', 
      answer: 'Son programas de entrenamiento con guía nutricional, seguimiento y ajustes según tus objetivos, nivel de experiencia y disponibilidad.' 
    },
    { 
      id: 'panel2', 
      question: '¿Cómo recibo mi plan una vez contratado?', 
      answer: 'Una vez coordinado el programa, recibirás las indicaciones para completar tu información inicial y acceder a tu rutina, guía nutricional y seguimiento.' 
    },
    { 
      id: 'panel3', 
      question: '¿Qué tipos de objetivos puedo trabajar con Ivis Fit?', 
      answer: 'Puedes elegir planes para pérdida de peso, aumento de masa muscular, tonificación (especialmente glúteos y abdomen), mejora de hábitos saludables o recomposición corporal.' 
    },
    { 
      id: 'panel4', 
      question: '¿Necesito tener experiencia previa en entrenamiento para comenzar?', 
      answer: '¡No! Diseño planes tanto para principiantes como para avanzados. Ajustamos cargas, ejercicios y rutinas según tu nivel y recursos disponibles.' 
    },
    { 
      id: 'panel5', 
      question: '¿Puedo entrenar en casa o necesito un gimnasio?', 
      answer: 'Ambos son posibles. Adapto tu plan según el equipamiento que tengas disponible: mancuernas, bandas elásticas o máquinas de gimnasio.' 
    },
    { 
      id: 'panel6', 
      question: '¿Dónde se hacen las asesorías?', 
      answer: 'Depende del programa: hay opciones digitales, 100% online, semi presenciales y presenciales.' 
    },
    { 
      id: 'panel7', 
      question: '¿Qué necesito para entrenar?', 
      answer: 'Depende del plan, pero puedo adaptarlo a gimnasio o a casa. Te aviso el material necesario.' 
    },
    { 
      id: 'panel8', 
      question: '¿Incluye alimentación?', 
      answer: 'Sí, todos los planes incluyen guía nutricional adaptada a tus objetivos.' 
    }
  ];

  return (
    <Box sx={{ width: "100%", height: "100%"}}>
      {accordions.map((accordion, index) => (
        <Accordion
          key={accordion.id}
          expanded={expanded === accordion.id}
          onChange={handleChange(accordion.id)}
          sx={{backgroundColor:"#ffffff", borderBottom: index !== accordions.length - 1 ? "1px solid #fdc915" : "none", boxShadow:"none",
            '&:before': {
              display: 'none' // Esto elimina la línea gris
            }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${accordion.id}-content`}
            id={`${accordion.id}-header`}
            sx={{
              '& .MuiSvgIcon-root': {
                color: '#fdc915'
              }
              ,padding:"10px 0"
            }}
          >
            <Box sx={{display:"flex", alignItems:"center", gap:"10px", height:"7vh" }}>
              <Typography component="span" sx={{color:"#3d3a3a", fontSize:"1.2rem",  fontWeight:"700"}}>
                {accordion.question}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{accordion.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};