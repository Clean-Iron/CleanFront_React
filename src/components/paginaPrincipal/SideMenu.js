import {React} from 'react';
import {List, ListItem, ListItemIcon, 
		ListItemText, ListItemButton} from '@mui/material';
import {Box, ModalClose, Drawer} from '@mui/joy';

import InboxIcon from '@mui/icons-material/Inbox';
import MapIcon from '@mui/icons-material/Map';
import ScheduleIcon from '@mui/icons-material/Schedule';


function SideMenu({isOpen, onClose, manejarClic}) {
	console.log('manejarClic:', manejarClic);
  const styles = {
    drawerPaper: {
      marginTop: 8 // height of AppBar
    }};
		const drawerOptions = [
			{ text: 'Mensajes', 
				icon: <InboxIcon />, 
				componente: 'mensajes' },
			{ text: 'Programación', 
				icon: <ScheduleIcon />, 
				componente: 'programacion' },
			{ text: 'Mapa', 
				icon: <MapIcon />, 
				componente: 'mapa' }
		]
  return (
    <div>
      <Drawer open={isOpen} onClose={onClose}
				variant="temporary"
				anchor="left"
				PaperProps={{
					sx: styles.drawerPaper,
				}}> 
				<Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            ml: 'auto',
            mt: 1,
            mr: 2,
          }}
        >
          <ModalClose id="close-icon" sx={{ position: 'initial' }} />
        </Box>
        <List>
        	{drawerOptions.map((option, index) => (
						<ListItem>
							<ListItemButton key={index} onClick={() => {manejarClic(option.componente)}}>
								<ListItemIcon>
									{option.icon}
								</ListItemIcon>
								<ListItemText primary={option.text} />
							</ListItemButton>
						</ListItem>
          ))}
        </List>
      </Drawer>
    </div>
    )
}

export default SideMenu;