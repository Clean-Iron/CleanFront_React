import {React} from 'react';
import {AppBar, Toolbar, Typography, 
    Button} from '@mui/material';


function Top() {
    return (
        <div>
            <AppBar position='fixed'>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{
                        flexGrow: 1 }}>Clean&Iron
                    </Typography>
                    <Button color="inherit" >Perfil</Button>
                    <Button color="inherit" >Cerrar sesión</Button>
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default Top;