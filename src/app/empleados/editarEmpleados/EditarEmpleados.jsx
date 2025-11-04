'use client';

import React, { useState, useRef, useEffect } from "react";
import BuscarEmpleados from "./BuscarEmpleados";
import EliminarEmpleados from "./EliminarEmpleados";
import AgregarEmpleados from "./AgregarEmpleados";
import { actualizarEmpleado } from "@/lib/Logic.js";
import { useCiudades } from "@/lib/Hooks";
import "@/styles/Empleados/EditarEmpleados.css";
import { Switch, Chip } from "@mui/material";

const EditarEmpleados = () => {
  const [activeTab, setActiveTab] = useState("edit");
  const [busquedaDocumento, setBusquedaDocumento] = useState("");
  const [empleadoEncontrado, setEmpleadoEncontrado] = useState(null);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [comentarios, setComentarios] = useState("");

  const { ciudades, isLoading: ciudadesLoading, isError: ciudadesError } = useCiudades();

  const [selectedCargo, setSelectedCargo] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [activo, setActivo] = useState(true);

  const [selectedTipoId, setSelectedTipoId] = useState("");
  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);
  const tipoIdOptions = ["CC", "PPT"];

  const [mensajeError, setMensajeError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarEliminarForm, setMostrarEliminarForm] = useState(false);

  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);
  const [cargoDropdownOpen, setCargoDropdownOpen] = useState(false);

  const ciudadDropdownRef = useRef(null);
  const cargoDropdownRef = useRef(null);
  const tipoIdDropdownRef = useRef(null);

  const cargos = [
    "Coordinador", "Supervisor", "Asistente Administrativo", "Secretario/a",
    "Auxiliar", "Contador", "Recursos Humanos", "Atención al Cliente", "Operario"
  ];

  // Helpers de mayúsculas y estilo visual
  const uc = (v) => (v ?? "").toString().toUpperCase();
  const inputUpper = { textTransform: "uppercase" };

  useEffect(() => {
    if (empleadoEncontrado) {
      // Normaliza a MAYÚSCULAS al cargar
      setNombre(uc(empleadoEncontrado.name));
      setApellido(uc(empleadoEncontrado.surname));
      setDocumento(uc(empleadoEncontrado.document));
      setEmail(uc(empleadoEncontrado.email));
      setPhone(uc(empleadoEncontrado.phone));
      setDireccion(uc(empleadoEncontrado.addressResidence));
      setComentarios(uc(empleadoEncontrado.comments));
      setSelectedCity(empleadoEncontrado.city || "");
      setSelectedCargo(empleadoEncontrado.position || "");
      setActivo(empleadoEncontrado.state === true || empleadoEncontrado.state === "true");
      setSelectedTipoId(uc(empleadoEncontrado.typeId));
      setFechaIngreso(empleadoEncontrado.entryDate ? empleadoEncontrado.entryDate : "");
    }
  }, [empleadoEncontrado]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cargoDropdownRef.current && !cargoDropdownRef.current.contains(event.target)) {
        setCargoDropdownOpen(false);
      }
      if (ciudadDropdownRef.current && !ciudadDropdownRef.current.contains(event.target)) {
        setCiudadDropdownOpen(false);
      }
      if (tipoIdDropdownRef.current && !tipoIdDropdownRef.current.contains(event.target)) {
        setTipoIdDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const manejarResultadoBusqueda = (datos) => {
    if (datos) {
      setEmpleadoEncontrado(datos);
      setMostrarFormulario(activeTab === "edit");
      setMostrarEliminarForm(activeTab === "delete");
      setMensajeError("");
    } else {
      setEmpleadoEncontrado(null);
      setMostrarFormulario(false);
      setMostrarEliminarForm(false);
      setMensajeError("Empleado no encontrado.");
    }
  };

  const guardarCambios = async () => {
    if (!empleadoEncontrado) return;

    const datosActualizados = {
      name: uc(nombre).trim(),
      surname: uc(apellido).trim(),
      email: uc(email).trim(),
      phone: uc(phone).trim(),
      addressResidence: uc(direccion).trim(),
      city: selectedCity,                 // si necesitas, puedes usar uc(selectedCity)
      document: uc(documento).trim(),
      typeId: uc(selectedTipoId).trim(),
      fechaIngreso,                       // si tu backend espera entryDate, cambia la clave
      position: selectedCargo,
      comments: uc(comentarios).trim(),
      state: !!activo
    };

    try {
      await actualizarEmpleado(empleadoEncontrado.id || empleadoEncontrado.document, datosActualizados);
      alert("Empleado actualizado correctamente ✅");
    } catch (error) {
      alert("Error al actualizar empleado ❌" + error);
    }
  };

  const resetBusqueda = () => {
    setBusquedaDocumento("");
    setEmpleadoEncontrado(null);
    setMostrarFormulario(false);
    setMostrarEliminarForm(false);
    setMensajeError("");
    setSelectedCargo("");
    setSelectedCity("");
    setSelectedTipoId("");
    setActivo(true);
    setNombre("");
    setApellido("");
    setDocumento("");
    setEmail("");
    setPhone("");
    setDireccion("");
    setFechaIngreso("");
    setComentarios("");
  };

  // Handlers de mayúsculas en tiempo real
  const onNombre = (e) => setNombre(uc(e.target.value));
  const onApellido = (e) => setApellido(uc(e.target.value));
  const onDocumento = (e) => setDocumento(uc(e.target.value));
  const onEmail = (e) => setEmail(uc(e.target.value));
  const onPhone = (e) => setPhone(uc(e.target.value));
  const onDireccion = (e) => setDireccion(uc(e.target.value));
  const onComentarios = (e) => setComentarios(uc(e.target.value));

  const renderFormulario = () => (
    <div className="empleados-form-grid">
      <div
        className="empleados-full-width empleados-form-grid"
        style={{ maxHeight: '45vh', overflowY: 'auto', paddingRight: '8px' }}
      >
        <div className="input-group">
          <label htmlFor="emp-nombre">Nombre(s)</label>
          <input id="emp-nombre" type="text" value={nombre} onChange={onNombre} style={inputUpper} />
        </div>

        <div className="input-group">
          <label htmlFor="emp-apellido">Apellido(s)</label>
          <input id="emp-apellido" type="text" value={apellido} onChange={onApellido} style={inputUpper} />
        </div>

        {/* Ciudad */}
        <div className="input-group" ref={ciudadDropdownRef}>
          <label htmlFor="emp-ciudad">Ciudad</label>
          <div className="dropdown">
            <button
              id="emp-ciudad"
              type="button"
              className={`dropdown-trigger ${ciudadDropdownOpen ? "open" : ""}`}
              onClick={() => setCiudadDropdownOpen(o => !o)}
            >
              <span>{selectedCity || (ciudadesLoading ? "Cargando ciudades…" : "Seleccionar ciudad")}</span>
              <span className="arrow">▼</span>
            </button>
            {ciudadDropdownOpen && (
              <div className="dropdown-content">
                {ciudadesLoading && <div>Cargando ciudades...</div>}
                {ciudadesError && <div>Error al cargar ciudades</div>}
                {!ciudadesLoading && !ciudadesError && (ciudades || []).map((ciu) => (
                  <button key={ciu} type="button" onClick={() => { setSelectedCity(ciu); setCiudadDropdownOpen(false); }}>
                    {ciu}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cargo */}
        <div className="input-group" ref={cargoDropdownRef}>
          <label htmlFor="emp-cargo">Cargo</label>
          <div className="dropdown">
            <button
              id="emp-cargo"
              type="button"
              className={`dropdown-trigger ${cargoDropdownOpen ? "open" : ""}`}
              onClick={() => setCargoDropdownOpen(o => !o)}
            >
              <span>{selectedCargo || "Seleccionar cargo"}</span>
              <span className="arrow">▼</span>
            </button>
            {cargoDropdownOpen && (
              <div className="dropdown-content">
                {cargos.map((cargo) => (
                  <button key={cargo} type="button" onClick={() => { setSelectedCargo(cargo); setCargoDropdownOpen(false); }}>
                    {cargo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tipo ID */}
        <div className="input-group" ref={tipoIdDropdownRef}>
          <label htmlFor="emp-tipoid">Tipo ID</label>
          <div className="dropdown">
            <button
              id="emp-tipoid"
              type="button"
              className={`dropdown-trigger ${tipoIdDropdownOpen ? "open" : ""}`}
              onClick={() => setTipoIdDropdownOpen(o => !o)}
            >
              <span>{selectedTipoId || "Selecc. Tipo ID"}</span>
              <span className="arrow">▼</span>
            </button>
            {tipoIdDropdownOpen && (
              <div className="dropdown-content">
                {tipoIdOptions.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => {
                      setSelectedTipoId(uc(tipo));
                      setTipoIdDropdownOpen(false);
                    }}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="emp-documento">N° Documento</label>
          <input id="emp-documento" type="text" value={documento} onChange={onDocumento} style={inputUpper} />
        </div>

        <div className="input-group">
          <label htmlFor="emp-email">Correo electrónico</label>
          <input id="emp-email" type="email" value={email} onChange={onEmail} style={inputUpper} />
        </div>

        <div className="input-group">
          <label htmlFor="emp-phone">N° Celular - Telefono</label>
          <input id="emp-phone" type="text" value={phone} onChange={onPhone} style={inputUpper} />
        </div>

        <div className="input-group">
          <label htmlFor="emp-direccion">Dirección</label>
          <input id="emp-direccion" type="text" value={direccion} onChange={onDireccion} style={inputUpper} />
        </div>

        {/* Estado */}
        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          <Chip
            size="small"
            label={activo ? "ACTIVO" : "INACTIVO"}
            color={activo ? "success" : "default"}
            variant={activo ? "filled" : "outlined"}
          />
        </div>

        <div className="input-group">
          <label htmlFor="emp-fechaIngreso">Fecha de Ingreso</label>
          <input id="emp-fechaIngreso" type="date" value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Comentarios</label>
          <textarea className="modal-asignacion-textarea" value={comentarios} onChange={onComentarios} style={inputUpper} />
        </div>
      </div>

      <div className="empleados-form-buttons empleados-full-width">
        <button type="button" className="menu-btn" onClick={resetBusqueda}>
          🔄 NUEVA BÚSQUEDA
        </button>
        <button type="submit" className="menu-btn" onClick={guardarCambios}>
          💾 GUARDAR CAMBIOS
        </button>
        <button type="reset" className="cancel-btn" onClick={resetBusqueda}>
          ❌ CANCELAR
        </button>
      </div>
    </div>
  );

  const renderForm = () => {
    if (activeTab === "edit") {
      return mostrarFormulario ? (
        renderFormulario()
      ) : (
        <BuscarEmpleados
          value={busquedaDocumento}
          onChange={(e) => setBusquedaDocumento(e.target.value)}
          onResultado={manejarResultadoBusqueda}
          mensajeError={mensajeError}
        />
      );
    }

    if (activeTab === "add") return <AgregarEmpleados />;

    if (activeTab === "delete") {
      return mostrarEliminarForm ? (
        <EliminarEmpleados empleadoData={empleadoEncontrado} onVolver={resetBusqueda} />
      ) : (
        <BuscarEmpleados
          value={busquedaDocumento}
          onChange={(e) => setBusquedaDocumento(e.target.value)}
          onResultado={manejarResultadoBusqueda}
          mensajeError={mensajeError}
        />
      );
    }
    return null;
  };

  return (
    <div className="container">
      <div className="empleados-wrapper">
        <div className="empleados-tab-container">
          <div className="empleados-tabs">
            <button className={`empleados-tab ${activeTab === "edit" ? "active" : ""}`} onClick={() => { setActiveTab("edit"); resetBusqueda(); }}>
              ✏️ Editar
            </button>
            <button className={`empleados-tab ${activeTab === "add" ? "active" : ""}`} onClick={() => { setActiveTab("add"); resetBusqueda(); }}>
              ➕ Agregar
            </button>
            <button className={`empleados-tab ${activeTab === "delete" ? "active" : ""}`} onClick={() => { setActiveTab("delete"); resetBusqueda(); }}>
              🗑️ Eliminar
            </button>
          </div>
          <div className="empleados-content-area">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarEmpleados;
