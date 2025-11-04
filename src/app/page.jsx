'use client';

import { useRouter } from 'next/navigation';
import { useServiceStates } from '../lib/Hooks';
import { useRef, useState } from 'react';
import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import '../styles/Inicio/ButtonInicio.css';
import '../styles/Inicio/LoginCard.css';

const Home = () => {
  const router = useRouter();
  const { serviceStates, isLoading, isError } = useServiceStates();
  const [formError, setFormError] = useState('');
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const form = e.currentTarget;
    const username = form.username?.value?.trim();
    const password = form.password?.value || '';

    if (!username || !password) {
      setFormError('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    try {
      if (!isLoading && !isError && serviceStates) {
        localStorage.setItem('serviceStates', JSON.stringify(serviceStates));
      }
    } catch {
      /* ignoramos error de localStorage */
    }

    router.push('/menu-principal');
  };

  const triggerSubmit = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <div className="containerInicio login-center">
      <div className="login-card">
        <div className="card" role="presentation">
          <div className="card2">
            <form
              ref={formRef}
              className="form"
              onSubmit={handleSubmit}
              noValidate
            >
              <h1 id="heading">Inicio Sesión</h1>

              {/* Usuario */}
              <div className="field field--light">
                <label htmlFor="username" className="sr-only">Usuario</label>
                <AccountCircleOutlined className="mui-icon" aria-hidden="true" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="input-field input-field--light"
                  placeholder="Usuario"
                  autoComplete="username"
                  required
                />
              </div>

              {/* Contraseña */}
              <div className="field field--light">
                <label htmlFor="password" className="sr-only">Contraseña</label>
                <LockOutlined className="mui-icon" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="input-field input-field--light"
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* Estados accesibles + error */}
              <div className="sr-only" role="status" aria-live="polite">
                {isLoading
                  ? 'Cargando estados del servicio…'
                  : isError
                  ? 'No se pudieron cargar los estados. Puedes intentar ingresar igualmente.'
                  : 'Estados listos para ingresar.'}
              </div>

              {formError && (
                <p className="login-error" role="alert">
                  {formError}
                </p>
              )}
            </form>

            <div className="btn login-submit">
              <button
                type="button"
                className="button type--A"
                aria-label="Ingresar"
                onClick={triggerSubmit}
                disabled={isLoading}
              >
                <div className="button__line" aria-hidden="true"></div>
                <div className="button__line" aria-hidden="true"></div>
                <span className="button__text">INGRESAR</span>
                <div className="button__drow1" aria-hidden="true"></div>
                <div className="button__drow2" aria-hidden="true"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
