"use client";

import { Box, TextField, Button, Alert, Snackbar, Modal, Typography } from "@mui/material";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import emailjs from "emailjs-com";
import { FaArrowRightLong } from "react-icons/fa6";
import { CONTACT_EMAIL } from "../../data/plans";

import { HomeImg, HomeText } from "@/features/landing/cms/HomeCmsFields";
import { LandingSectionHeader } from "@/features/landing/components/shared/LandingSectionHeader";

const contactFieldSx = {
  "& .MuiOutlinedInput-root": { fontSize: { xs: "1rem", sm: "1.05rem" } },
} as const;

const defaultImage = "/imgs/campeonato.JPG";

// EmailJS configuration - validate environment variables
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  toEmail: process.env.NEXT_PUBLIC_EMAILJS_TO_EMAIL,
};

export const Contacto2 = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success"
  });
  const [modalOpen, setModalOpen] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const validateEmailConfig = () => {
    const missing = [];
    if (!EMAILJS_CONFIG.serviceId) missing.push('Service ID');
    if (!EMAILJS_CONFIG.templateId) missing.push('Template ID');
    if (!EMAILJS_CONFIG.publicKey) missing.push('Public Key');
    
    if (missing.length > 0) {
      console.error('Missing EmailJS configuration:', missing.join(', '));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate configuration first
    if (!validateEmailConfig()) {
      setSnackbar({
        open: true,
        message: "Error de configuración del servicio de email. Contacta al administrador.",
        severity: "error"
      });
      setIsLoading(false);
      return;
    }

    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId!,
        EMAILJS_CONFIG.templateId!,
        {
          from_name: formData.name,
          from_phone: formData.phone,
          from_email: formData.email,
          message: formData.message,
          to_email: EMAILJS_CONFIG.toEmail || CONTACT_EMAIL,
          reply_to: formData.email
        },
        EMAILJS_CONFIG.publicKey!
      );

      // Mostrar modal de éxito en lugar del snackbar
      setModalOpen(true);

      // Limpiar formulario
      setFormData({
        name: "",
        phone: "",
        email: "",
        message: ""
      });

    } catch (error: unknown) {
      console.error("Error enviando email:", error);
      
      let errorMessage = "Error al enviar el mensaje. Por favor, intenta nuevamente.";
      
      // Provide more specific error messages
      if (typeof error === "object" && error !== null && "text" in error && typeof error.text === "string") {
        console.error("EmailJS Error:", error.text);
        if (error.text.includes('Invalid service ID')) {
          errorMessage = "Error de configuración: Service ID inválido.";
        } else if (error.text.includes('Invalid template ID')) {
          errorMessage = "Error de configuración: Template ID inválido.";
        } else if (error.text.includes('Invalid public key')) {
          errorMessage = "Error de configuración: Public Key inválida.";
        } else if (error.text.includes('network')) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet.";
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Box 
      component="section"
      className="landing-contact-section"
      sx={{ 
        minHeight: "100vh", 
        width: "100%", 
        display: {xs: "flex", lg: "none"}, 
        alignItems: "center", 
        justifyContent: "center", 
        flexDirection: "column",
        overflow: "hidden" 
      }}
    >
      <Box sx={{ 
        width: "100%", 
        height: "100%", 
        position: "relative",
        overflow: "hidden",
        "& img": { objectFit: "cover", objectPosition: "center top" },
      }}>
        <HomeImg
          field="contacto2.image"
          fallback={defaultImage}
          alt="fondoDerechaImagen"
          fill
          sizes="100vw"
        />
      </Box>
      
      <Box sx={{ 
        width: "100%", 
        height: "100%",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-around",
        flexDirection: "column",
        padding: "0 5vw"
      }}>
        <Box 
          component="form"
          onSubmit={handleSubmit}
          sx={{ 
            width: "100%", 
            height: "80%",
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            justifyContent: "space-evenly",
            gap: 3 
          }}
          id="contacto"
        >
          <LandingSectionHeader
            centered
            tone="contact"
            eyebrow={<HomeText field="contacto.eyebrow" />}
            title={<HomeText field="contacto.title" />}
            highlight={<HomeText field="contacto.titleHighlight" />}
            sx={{ mb: 0 }}
          />
          
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <TextField 
              id="name"
              className="landing-form-field"
              label="Nombre" 
              variant="outlined" 
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              sx={{ ...contactFieldSx, width: "50%" }}
            />
            <TextField 
              id="phone"
              className="landing-form-field"
              label="Teléfono" 
              variant="outlined" 
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              sx={{ ...contactFieldSx, width: "50%" }}
            />
          </Box>
          
          <TextField 
            id="email"
            className="landing-form-field"
            label="Email" 
            variant="outlined" 
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            sx={{ ...contactFieldSx, width: "100%" }}
          />
        
          <TextField
            id="message"
            className="landing-form-field"
            label="Mensaje"
            variant="outlined"
            multiline
            rows={10}
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isLoading}
            sx={{ ...contactFieldSx, width: "100%" }}
          />
          
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
            <Button
              type="submit"
              className="landing-form-submit"
              variant="contained"
              endIcon={<FaArrowRightLong />}
              disabled={isLoading}
              sx={{
                padding: "2vh 6vw",
                alignSelf: "flex-start",
                marginTop: "1rem",
                fontSize: "2vh",
                marginBottom: "3rem",
              }}
            >
              {isLoading ? "Enviando..." : "Enviar Mensaje"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Modal para éxito - optimizado para móvil */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-success-title"
        aria-describedby="modal-success-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            padding: 3,
            borderRadius: 2,
            boxShadow: 24,
            width: '90%',
            maxWidth: 400,
            textAlign: 'center',
            mx: 2,
          }}
        >
          <Typography 
            id="modal-success-title" 
            variant="h5" 
            component="h2" 
            sx={{ 
              color: "var(--landing-contact-brown)", 
              mb: 2,
              fontSize: { xs: '1.5rem', sm: '1.75rem' }
            }}
          >
            ¡Mensaje Enviado!
          </Typography>
          <Typography 
            id="modal-success-description" 
            sx={{ 
              mb: 3,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            Tu mensaje ha sido enviado correctamente. Te contactare pronto.
          </Typography>
          <Button
            onClick={handleCloseModal}
            className="landing-form-submit"
            variant="contained"
            sx={{
              padding: '10px 30px',
              fontSize: '1rem'
            }}
          >
            Aceptar
          </Button>
        </Box>
      </Modal>

      {/* Snackbar para mostrar mensajes de error */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};