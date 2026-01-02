'use client';

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "../lib/Logic";

import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";

import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import "../styles/Inicio/ButtonInicio.css";
import "../styles/Inicio/LoginCard.css";

const Home = () => {
  const router = useRouter();

  const [formError, setFormError] = useState("");
  const [bannerMsg, setBannerMsg] = useState("");
  const [bannerSeverity, setBannerSeverity] = useState("info");
  const [bannerOpen, setBannerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef(null);

  const reasonMessage = (reason) => {
    switch ((reason || "").toLowerCase()) {
      case "session":
        return { msg: "Tu sesión expiró. Inicia sesión nuevamente.", severity: "warning" };
      case "timeout":
        return { msg: "No hay conexión o el servidor tardó demasiado. Intenta de nuevo.", severity: "error" };
      case "logout":
        return { msg: "Sesión cerrada correctamente.", severity: "success" };
      default:
        return { msg: "", severity: "info" };
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("reason");
    const { msg, severity } = reasonMessage(reason);

    if (msg) {
      setBannerMsg(msg);
      setBannerSeverity(severity);
      setBannerOpen(true);
    }

    if (reason) {
      params.delete("reason");
      const next = params.toString();
      const newUrl = next ? `/?${next}` : "/";
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const form = e.currentTarget;
    const username = form.username?.value?.trim();
    const password = form.password?.value || "";

    if (!username || !password) {
      setFormError("Por favor ingresa tu usuario y contraseña.");
      return;
    }

    setSubmitting(true);

    try {
      const auth = await login(username, password);

      localStorage.setItem("token", auth.token);
      localStorage.setItem("expiresAt", auth.expiresAt);
      localStorage.setItem(
        "authUser",
        JSON.stringify({ username: auth.username, roles: auth.roles })
      );

      router.push("/menu-principal");
    } catch (err) {
      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        setFormError("Usuario o contraseña incorrectos.");
      } else if (err?.code === "ECONNABORTED" || /timeout/i.test(err?.message || "")) {
        setFormError("No hay conexión o el servidor tardó demasiado. Intenta de nuevo.");
      } else {
        setFormError("No fue posible iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const triggerSubmit = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <div className="containerInicio login-center">
      <div className="login-card">
        <div className="card" role="presentation">
          <div className="card2">
            <Collapse in={bannerOpen}>
              <Alert
                severity={bannerSeverity}
                sx={{ mb: 2 }}
                action={
                  <IconButton
                    aria-label="cerrar"
                    color="inherit"
                    size="small"
                    onClick={() => setBannerOpen(false)}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                {bannerMsg}
              </Alert>
            </Collapse>

            <form ref={formRef} className="form" onSubmit={handleSubmit} noValidate>
              <h1 id="heading">Inicio Sesión</h1>

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
                  disabled={submitting}
                />
              </div>

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
                  disabled={submitting}
                />
              </div>

              {formError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {formError}
                </Alert>
              )}
            </form>

            <div className="btn login-submit">
              <button
                type="button"
                className="button type--A"
                aria-label="Ingresar"
                onClick={triggerSubmit}
                disabled={submitting}
              >
                <div className="button__line" aria-hidden="true"></div>
                <div className="button__line" aria-hidden="true"></div>
                <span className="button__text">
                  {submitting ? "INGRESANDO..." : "INGRESAR"}
                </span>
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
