import {useState, React} from 'react';
import {AppBar, Toolbar, Typography, Button, IconButton} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SideMenu from './SideMenu';


function Top({ manejarClic }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsMenuOpen(open);
  };
  return (
    <div>
      <AppBar position='fixed' color='primary' 
        sx={{ borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <SideMenu isOpen={isMenuOpen} onClose={toggleDrawer(false)} manejarClic={manejarClic} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Clean&Iron
          </Typography>
          <Button color="inherit" sx={{ borderRadius: 15 }}>Perfil</Button>
          <Button color="inherit" sx={{ borderRadius: 15 }}>Cerrar sesión</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Top;