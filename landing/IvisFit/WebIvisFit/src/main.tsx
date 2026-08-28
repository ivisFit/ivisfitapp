import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'
import App from './App.tsx'
import { PlanDetail } from './components/PlanDetail/index.tsx';
import { createTheme, ThemeProvider } from '@mui/material';
import { PlanDetail2 } from './components/PlanDetail2/index.tsx';
import { PlanDetail3 } from './components/PlanDetail3/index.tsx';
import { PlanDetail4 } from './components/PlanDetail4/index.tsx';
import { PlanDetail5 } from './components/PlanDetail5/index.tsx';
import { PlanDetail6 } from './components/PlanDetail6/index.tsx';
import ScrollToTop from './components/ScrollToTop/index.tsx';
import { WhatsAppButton } from './components/Buttons/WhatsAppButton.tsx';
import { WHATSAPP_PHONE } from './data/plans.ts';



declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    xssm: true;
    xssmm:true;
    sm: true;// Añadir breakpoint personalizado
    smmid: true; // Añadir breakpoint personalizado
    smmd: true;  // Añadir breakpoint personalizado
    md: true;
    lg: true;
    xl: true;
  }
}

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      xssm:520,
      xssmm:543,
      sm: 600,
      smmid:720,
      smmd:768,
      md: 900,
      lg: 1200,
      xl: 1536,
      
    },
  },
});

 

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <ThemeProvider theme={theme} >
    <Router>
        <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/gluteos" element={<PlanDetail3 />} />
        <Route path="/abs-power" element={<PlanDetail5 />} />
        <Route path="/mami-fit" element={<PlanDetail6 />} />
        <Route path="/online" element={<PlanDetail />} />
        <Route path="/semi-presencial" element={<PlanDetail4 />} />
        <Route path="/presencial" element={<PlanDetail2 />} />
      </Routes>
    </Router>
    </ThemeProvider>
    {/* WhatsAppButton fuera del scroll también si es fixed */}
      <WhatsAppButton phoneNumber={WHATSAPP_PHONE}/>
    
  </StrictMode>,
)
