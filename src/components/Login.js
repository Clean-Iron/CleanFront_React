import {React} from 'react';
import { Button, Box, 
	Container, Typography, Input, Divider } from '@mui/joy';



function LogIn(){
    return(
      <Container component="main" maxWidth="xs">
        <Box sx={{
					marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          justifyContent: 'center',
          borderRadius: '15px', // Contorno redondeado
          boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)', // Sombra alrededor del box
          backgroundColor: 'cyan', // Fondo blanco para que sobresalga
          padding: '20px'}}>
          <Typography component="h1" variant="h5">Iniciar sesión</Typography>
					<Divider/>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Input
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Correo electrónico"
                name="email"
                autoComplete="email"
                autoFocus
								placeholder="Usuario"
            />
            <Input
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
								placeholder="Contraseña"
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{mt: 3,
									mb: 2,
									backgroundColor: '#9c27b0', // Color de fondo morado
									color: 'white', // Texto blanco
									'&:hover': {
										backgroundColor: '#7b1fa2', // Oscurecer el color de fondo cuando se pasa el mouse por encima
									},
									boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)'}}
            >Iniciar sesión</Button>
						
						<Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{mt: 3,
									mb: 2,
									backgroundColor: '#3f51b5', // Color de fondo azul
									color: 'white', // Texto blanco
									'&:hover': {
										backgroundColor: '#303f9f', // Oscurecer el color de fondo cuando se pasa el mouse por encima
									},
									boxShadow: '0 3px 5px 2px rgba(63, 81, 181, .3)'}}
            >Registrarse</Button>
        </Box>
      </Box>
    </Container>
    )
}

export default LogIn;