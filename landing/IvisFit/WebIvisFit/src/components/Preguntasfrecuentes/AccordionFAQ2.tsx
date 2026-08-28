import React, { useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const AccordionFAQ2 = () => {
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
      question: '¿Cómo es el seguimiento durante la asesoría?', 
      answer: 'Depende del plan elegido: algunos incluyen check-ins regulares, seguimiento semanal, soporte limitado o soporte ilimitado vía App.' 
    },
    { 
      id: 'panel7', 
      question: '¿Los programas incluyen alimentación?', 
      answer: 'Sí, los programas incluyen guía nutricional o plan alimenticio según el tipo de programa contratado.' 
    },
    { 
      id: 'panel8', 
      question: '¿Cuánto duran los planes?', 
      answer: 'Hay programas de 4 semanas y de 8 semanas. El entrenamiento presencial se coordina de forma mensual según días y horarios disponibles.' 
    },
    { 
      id: 'panel9', 
      question: '¿Qué medios de pago se aceptan?', 
      answer: 'Se aceptan transferencias bancarias, Mercado Pago y PayPal. Desde Uruguay o desde el exterior.' 
    },
    { 
      id: 'panel10', 
      question: '¿En cuánto tiempo veré resultados?', 
      answer: 'Depende de la constancia, alimentación y descanso. Muchos clientes comienzan a notar cambios desde la cuarta semana, pero buscamos resultados sostenibles y saludables, no soluciones rápidas.' 
    },
    { 
      id: 'panel11', 
      question: '¿Dónde se hacen las asesorías?', 
      answer: 'Depende del programa: hay opciones digitales, 100% online, semi presenciales y presenciales.' 
    },
    { 
      id: 'panel12', 
      question: '¿Qué necesito para entrenar?', 
      answer: 'Depende del plan, pero puedo adaptarlo a gimnasio o a casa. Te aviso el material necesario.' 
    },
    { 
      id: 'panel13', 
      question: '¿Incluye alimentación?', 
      answer: 'Sí, todos los planes incluyen guía nutricional adaptada a tus objetivos.' 
    },
    { 
      id: 'panel14', 
      question: '¿Cuál es el plan ideal para mí?', 
      answer: 'Escríbeme por WhatsApp y revisamos tu objetivo, disponibilidad, experiencia y si entrenas en casa, gym o presencial.' 
    },
    { 
      id: 'panel15', 
      question: '¿Cómo se paga?', 
      answer: 'Acepto transferencias, depósito o pago por PayPal.' 
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
            }}
          >
            <Box sx={{display:"flex", alignItems:"center", gap:"10px", height:"7vh", padding:"35px 0"}}>
              <Typography component="span" sx={{color:"#3d3a3a", fontSize:"2.3vh"}}>
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