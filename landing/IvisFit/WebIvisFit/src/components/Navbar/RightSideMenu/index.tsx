import { useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { 
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  HelpOutline,
  Contacts,
  LocalAtm
} from '@mui/icons-material';

export const RightSideMenu = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (isOpen: boolean) => (event: KeyboardEvent | MouseEvent) => {
    if ('key' in event && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(isOpen);
  };

  const menuItems = [
    { text: 'Inicio', icon: <HomeIcon />, ancla: "#inicio" },
    { text: 'Conóceme', icon: <InfoIcon />  , ancla: "#conoceme-section" },
    { text: 'Planes', icon: <LocalAtm />  , ancla: "#planes" },
    { text: 'Preguntas Frecuentes', icon: <HelpOutline /> , ancla: "#preguntas-frecuentes" },
    { text: 'Contacto', icon: <Contacts />  , ancla: "#contacto" },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
        <Toolbar>
         
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ ml: 2 }}
          >
            <MenuIcon sx={{width:"50px", height:"50px", color:"#FDC915"}}/>
          </IconButton>
        </Toolbar>


      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            backgroundColor: '#f5f5f5',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 1,
            color: 'white'
          }}
        >
          <IconButton onClick={toggleDrawer(false)} >
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {menuItems.map((item) => (
            <a href={`${item.ancla}`} style={{ textDecoration: 'none', color: 'inherit'}}>
            <ListItem onClick={()=> setOpen(false)} key={item.text} sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}>
              <ListItemIcon sx={{ color:"#FDC915" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
            </a>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};
