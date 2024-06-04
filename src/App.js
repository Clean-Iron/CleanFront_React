
import {React, useState} from 'react';
import './App.css';
import SideMenu from './components/paginaPrincipal/SideMenu';
import Schedule from './components/paginaPrincipal/calendario/Schedule';
import Top from './components/paginaPrincipal/Top';

function App() {
  const [componente, setComponente] = useState('programacion');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const manejarClic = (nuevoComponente) => {
    setComponente(nuevoComponente);
    setIsMenuOpen(false); // Cerrar el menú al hacer clic en una opción
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsMenuOpen(open);
  };

  return (
    <div>
      <Top 
        manejarClic={manejarClic}
      />
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={toggleDrawer(false)} 
        manejarClic={manejarClic} 
      />
      {componente === 'programacion' && <Schedule />}
      {componente === 'mapa' && <p>Hola</p>}
    </div>
  );
}

export default App;
