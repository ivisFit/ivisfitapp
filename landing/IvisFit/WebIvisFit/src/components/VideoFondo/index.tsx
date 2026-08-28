import { Box } from "@mui/material"
import video from "../../../public/videos/video-inicio.mp4"


export const VideoFondo = () => {
  return (
    <Box sx={{width:"100%", height:"100vh",minHeight:"500px", zIndex:"1", position:"relative", boxSizing:"border-box", overflow:"hidden"}}>
      <video id="inicio"  style={{
        position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          minWidth: "100%",
          minHeight: "100%",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          backgroundColor: "#090708",
          pointerEvents: "none"
      }}
        autoPlay
        muted 
        loop 
        playsInline
        >
        <source src={video} type="video/mp4" style={{boxSizing:"border-box"}}/>
        Tu navegador no soporta el elemento de video.
      </video>

      {/* Capa de oscurecido + degradado premium para legibilidad y profundidad */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(105deg, rgba(9,7,8,0.86) 0%, rgba(9,7,8,0.62) 42%, rgba(9,7,8,0.35) 70%, rgba(9,7,8,0.55) 100%)',
        pointerEvents: 'none',
        boxSizing:"border-box"
      }} />

      {/* Viñeta inferior para fundir el hero con la siguiente sección */}
      <Box sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '32vh',
        background: 'linear-gradient(to bottom, rgba(9,7,8,0) 0%, rgba(9,7,8,0.55) 60%, rgba(9,7,8,0.92) 100%)',
        pointerEvents: 'none',
        boxSizing:"border-box"
      }} />

      {/* Resplandor dorado sutil */}
      <Box sx={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '45vw',
        height: '45vw',
        background: 'radial-gradient(circle, rgba(225,170,67,0.18) 0%, rgba(225,170,67,0) 65%)',
        pointerEvents: 'none',
        boxSizing:"border-box"
      }} />
    </Box>
  )
}
