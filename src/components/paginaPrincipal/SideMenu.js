import {React} from 'react';
import {Drawer, List, ListItem, ListItemIcon, 
		ListItemText, ListItemButton} from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import MapIcon from '@mui/icons-material/Map';
import ScheduleIcon from '@mui/icons-material/Schedule';

function SideMenu() {
  const styles = {
    drawerPaper: {
      marginTop: 10, // height of AppBar
    }};
	const drawerOptions = [
		{ text: 'Mensajes', icon: <InboxIcon /> },
		{ text: 'Programación', icon: <ScheduleIcon /> },
		{ text: 'Mapa', icon: <MapIcon /> }
	];
  return (
    <div>
      <Drawer 
				variant="permanent"
				anchor="left"
				PaperProps={{
					sx: styles.drawerPaper,
				}}> 
        <List>
          {drawerOptions.map((option, index) => (
						<ListItem>
							<ListItemButton key={index} onClick={() => console.log(`Clicked: ${option.text}`)}>
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