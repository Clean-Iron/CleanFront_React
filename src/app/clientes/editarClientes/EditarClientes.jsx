import React, { useState, useRef, useEffect } from "react";
import BuscarClientes from "./buscarClientes/BuscarClientes";
import EliminarClientes from "./eliminarClientes/EliminarClientes";
import AgregarClientes from "./agregarClientes/AgregarClientes";
import ModalEditarDirecciones from "./modalEditarDirecciones/ModalEditarDirecciones.jsx";
import { actualizarCliente } from "@/lib/Services/Logic.js";
import "../../../styles/Empleados/EditarEmpleados/EditarEmpleados.css";

const EditarClientes = () => {
  const [activeTab, setActiveTab] = useState("edit");
  const [busquedaDocumento, setBusquedaDocumento] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [typeId, setTypeId] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [direcciones, setDirecciones] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mostrarEliminarForm, setMostrarEliminarForm] = useState(false);
  const [mostrarModalDirecciones, setMostrarModalDirecciones] = useState(false);

  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);
  const ciudadDropdownRef = useRef(null);

  const ciudades = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Cartagena"];

  useEffect(() => {
    if (clienteEncontrado) {
      setTypeId(clienteEncontrado.typeId || "");
      setNombre(clienteEncontrado.name || "");
      setApellido(clienteEncontrado.surname || "");
      setDocumento(clienteEncontrado.document || "");
      setEmail(clienteEncontrado.email || "");
      setPhone(clienteEncontrado.phone || "");
      setDirecciones(clienteEncontrado.addresses || []);
      setSelectedCity(clienteEncontrado.city || "");
    }
  }, [clienteEncontrado]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ciudadDropdownRef.current && !ciudadDropdownRef.current.contains(event.target)) {
        setCiudadDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const manejarResultadoBusqueda = (datos) => {
    if (datos) {
      setClienteEncontrado(datos);

      if (activeTab === "edit") {
        setMostrarFormulario(true);
      } else if (activeTab === "delete") {
        setMostrarEliminarForm(true);
      }

      setMensajeError("");
    } else {
      setClienteEncontrado(null);
      setMostrarFormulario(false);
      setMostrarEliminarForm(false);
      setMensajeError("Cliente no encontrado.");
    }
  };

  // Función para manejar el guardado de direcciones desde el modal
  const manejarGuardarDirecciones = (nuevasDirecciones) => {
    setDirecciones(nuevasDirecciones);
    // Actualizar también el cliente encontrado
    setClienteEncontrado(prev => ({
      ...prev,
      addresses: nuevasDirecciones
    }));
  };

  const guardarCambios = async () => {
    if (!clienteEncontrado) return;

    const datosActualizados = {
      typeId: typeId,
      name: nombre,
      surname: apellido,
      email: email,
      phone: phone,
      addresses: direcciones,
      city: selectedCity,
      document: documento
    };

    try {
      console.log(datosActualizados);
      await actualizarCliente(clienteEncontrado.document, datosActualizados);
      alert("Cliente actualizado correctamente ✅");
    } catch (error) {
      alert("Error al actualizar cliente ❌" + error);
    }
  };

  const resetBusqueda = () => {
    setBusquedaDocumento("");
    setClienteEncontrado(null);
    setMostrarFormulario(false);
    setMostrarEliminarForm(false);
    setMensajeError("");
  };

  const renderFormulario = () => (
    <div className="empleados-form-grid">
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
      />
      <input
        type="text"
        placeholder="Documento"
        value={documento}
        onChange={(e) => setDocumento(e.target.value)}
      />
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="Teléfono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {/* Botón para abrir el modal de direcciones */}
      <button
        type="button"
        className="menu-btn"
        onClick={() => setMostrarModalDirecciones(true)}
      >
        📍 Editar Direcciones ({direcciones.length})
      </button>

      <div className="empleados-form-buttons empleados-full-width">
        <button type="button" className="menu-btn" onClick={resetBusqueda}>
          🔄 NUEVA BÚSQUEDA
        </button>
        <button type="submit" className="menu-btn" onClick={guardarCambios}>
          💾 GUARDAR CAMBIOS
        </button>
        <button type="reset" className="menu-btn" onClick={resetBusqueda}>
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
        <BuscarClientes
          value={busquedaDocumento}
          onChange={(e) => setBusquedaDocumento(e.target.value)}
          onResultado={manejarResultadoBusqueda}
          mensajeError={mensajeError}
        />
      );
    }

    if (activeTab === "add") {
      return <AgregarClientes />;
    }

    if (activeTab === "delete") {
      return mostrarEliminarForm ? (
        <EliminarClientes
          cliente={clienteEncontrado}
          onVolver={resetBusqueda}
        />
      ) : (
        <BuscarClientes
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
            <button
              className={`empleados-tab ${activeTab === "edit" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("edit");
                resetBusqueda();
              }}
            >
              ✏️ Editar
            </button>
            <button
              className={`empleados-tab ${activeTab === "add" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("add");
                resetBusqueda();
              }}
            >
              ➕ Agregar
            </button>
            <button
              className={`empleados-tab ${activeTab === "delete" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("delete");
                resetBusqueda();
              }}
            >
              🗑️ Eliminar
            </button>
          </div>
          <div className="empleados-content-area">
            {renderForm()}
          </div>
        </div>
      </div>

      {/* Modal para editar direcciones */}
      {mostrarModalDirecciones && (
        <ModalEditarDirecciones
          cliente={clienteEncontrado}
          onClose={() => setMostrarModalDirecciones(false)}
          onGuardar={manejarGuardarDirecciones}
        />
      )}
    </div>
  );
};

export default EditarClientes;