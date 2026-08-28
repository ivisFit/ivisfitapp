import React, { useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const AccordionFAQ3 = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Datos para los acordeones con las preguntas y respuestas reales
  const accordions = [
    { 
      id: 'panel1', 
      question: ' ¿Cuál es el plan ideal para mí?', 
      answer: 'Escríbeme por WhatsApp y revisamos tu objetivo, disponibilidad, experiencia y si entrenas en casa, gym o presencial.' 
    },
    { 
      id: 'panel2', 
      question: '¿Cómo se paga?', 
      answer: 'Acepto transferencias, depósito o pago por PayPal.' 
    },
    { 
      id: 'panel3', 
      question: '¿Cómo es el seguimiento durante la asesoría?', 
      answer: 'Depende del plan elegido: algunos incluyen check-ins regulares, seguimiento semanal, soporte limitado o soporte ilimitado vía App.' 
    },
    { 
      id: 'panel4', 
      question: '¿Los programas incluyen alimentación?', 
      answer: 'Sí, los programas incluyen guía nutricional o plan alimenticio según el tipo de programa contratado.' 
    },
    { 
      id: 'panel5', 
      question: '¿Cuánto duran los planes?', 
      answer: 'Hay programas de 4 semanas y de 8 semanas. El entrenamiento presencial se coordina de forma mensual según días y horarios disponibles.' 
    },
    { 
      id: 'panel6', 
      question: '¿Qué medios de pago se aceptan?', 
      answer: 'Se aceptan transferencias bancarias, Mercado Pago y PayPal. Desde Uruguay o desde el exterior.' 
    },
    { 
      id: 'panel7', 
      question: '¿En cuánto tiempo veré resultados?', 
      answer: 'Depende de la constancia, alimentación y descanso. Muchos clientes comienzan a notar cambios desde la cuarta semana, pero buscamos resultados sostenibles y saludables, no soluciones rápidas.' 
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
            <Box sx={{display:"flex", alignItems:"center", gap:"10px", height:"7vh"}}>
              <Typography component="span" sx={{color:"#3d3a3a", fontSize:"1.2rem", fontWeight:"700"}}>
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