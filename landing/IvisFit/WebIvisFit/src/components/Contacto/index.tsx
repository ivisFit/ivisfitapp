import { Box, TextField, Button, Alert, Snackbar, Modal, Typography } from "@mui/material";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import emailjs from "emailjs-com";
import { FaArrowRightLong } from "react-icons/fa6";
import { CONTACT_EMAIL } from "../../data/plans";

// Use a public URL for images in the public folder
const imagen = "/imgs/campeonato.JPG";

// EmailJS configuration - validate environment variables
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID ,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ,
  toEmail: import.meta.env.VITE_EMAILJS_TO_EMAIL 
};

export const Contacto = () => {
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
      sx={{ 
        minHeight: "100vh",
        width: "100%", 
        backgroundColor: "#e8e9ea", 
        display: {xs: "none", lg: "flex"},
        overflow: "hidden" 
      }}
    >
      <Box sx={{ 
        width: "50%", 
        minHeight: "100vh",
        position: "relative", 
        overflow: "hidden" 
      }}>
        <img 
          style={{ 
            width: "100%", 
            height: "100%", 
            objectFit: "cover", 
            objectPosition: "center top",
            position: "absolute",
            top: 0,
            left: 0
          }} 
          src={imagen} 
          alt="fondoDerechaImagen" 
        />
      </Box>
      
      <Box 
        sx={{ 
          width: "50%",
          minHeight: "100vh",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-around",
          flexDirection: "column",
          padding: "0 5vw"
        }}
        id="contacto-section"
      >
        <Box 
          component="form"
          onSubmit={handleSubmit}
          sx={{ 
            width: "100%", 
            height: "100%",
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-evenly",
            gap: 3 
          }}
        >
          <Box sx={{ textAlign: "center", marginBottom: "1rem" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.7rem",
                color: "#a07d5e",
                letterSpacing: "0.4rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                textTransform: "uppercase",
                mb: "0.9rem",
              }}
            >
              <Box sx={{ width: "32px", height: "2px", backgroundColor: "#a07d5e" }} />
              {"Hablemos"}
              <Box sx={{ width: "32px", height: "2px", backgroundColor: "#a07d5e" }} />
            </Box>
            <Box
              component="h2"
              className="oswald-fuente"
              sx={{
                color: "#7f6147",
                letterSpacing: "0.2rem",
                fontSize: "min(7vh, 70px)",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              {"Contacta "}
              <Box component="span" sx={{ color: "#5c4633" }}>
                {"Conmigo"}
              </Box>
            </Box>
            <Box
              sx={{
                width: "72px",
                height: "3px",
                background: "linear-gradient(90deg, #b88a5e 0%, #7f6147 100%)",
                borderRadius: "2px",
                margin: "1rem auto 0",
              }}
            />
          </Box>
          
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField 
              id="name"
              label="Nombre" 
              variant="outlined" 
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              style={{backgroundColor: "#ffffff", width: "50%", borderRadius: "7px", fontSize: "3vh"}}
            />
            <TextField 
              id="phone"
              label="Teléfono" 
              variant="outlined" 
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              style={{backgroundColor: "#ffffff", width: "50%", borderRadius: "7px", fontSize: "3vh"}}
            />
          </Box>
          
          <TextField 
            id="email"
            label="Email" 
            variant="outlined" 
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{backgroundColor: "#ffffff", width: "100%", borderRadius: "7px", fontSize: "3vh"}}
          />
        
          <TextField
            id="message"
            label="Mensaje"
            variant="outlined"
            multiline
            rows={10}
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isLoading}
            style={{backgroundColor: "#ffffff", width: "100%", borderRadius: "7px", fontSize: "3vh"}}
          />
          
          <Button
            type="submit"
            variant="contained"
            endIcon={<FaArrowRightLong />}
            disabled={isLoading}
            sx={{
              backgroundColor: "#7f6147",
              color: "#ffffff",
              padding: "2vh 3vw",
              borderRadius: "7px",
              '&:hover': {
                backgroundColor: "#6a523c",
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
                color: '#666666'
              },
              alignSelf: "flex-start",
              fontSize: "1rem",
              marginBottom: "10px"
            }}
          >
            {isLoading ? "Enviando..." : "Enviar Mensaje"}
          </Button>
        </Box>
      </Box>

      {/* Modal para éxito */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-success-title"
        aria-describedby="modal-success-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            padding: 4,
            borderRadius: 2,
            boxShadow: 24,
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <Typography id="modal-success-title" variant="h5" component="h2" sx={{ color: "#7f6147", mb: 2 }}>
            ¡Mensaje Enviado!
          </Typography>
          <Typography id="modal-success-description" sx={{ mb: 3 }}>
            Tu mensaje ha sido enviado correctamente. Te contactare pronto.
          </Typography>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            sx={{
              backgroundColor: "#7f6147",
              '&:hover': {
                backgroundColor: "#6a523c",
              },
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