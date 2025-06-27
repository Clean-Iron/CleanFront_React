import React from "react";
//import "../../styles/Empleados/MenuLateral.css";
import Link from "next/link";

const Sidebar = ({ onNavClick, seccionActiva }) => {
	return (
		<div className="menu-lateral">
			<Link href={"/menu-principal"} className="btn-53">
				<div className="original">⬅ Regresar</div>
				<div className="letters">
					<span>M</span>
					<span>E</span>
					<span>N</span>
					<span>Ú</span>
				</div>
			</Link>
			<div className="menu-buttons">
				<ul>
					<li>
						<button
							className={`menu-btn ${seccionActiva === "infoGeneral" ? "activo" : ""}`}
							onClick={() => onNavClick("infoGeneral")}
						>
							📋 Información General
						</button>
					</li>
					<li>
						<button
							className={`menu-btn ${seccionActiva === "listaClientes" ? "activo" : ""}`}
							onClick={() => onNavClick("listaEmpleados")}
						>
							📋 Lista de Empleados
						</button>
					</li>
					<li>
						<button
							className={`menu-btn ${seccionActiva === "agregarCliente" ? "activo" : ""}`}
							onClick={() => onNavClick("editarEmpleados")}
						>
							➕ Editar Empleado
						</button>
					</li>
					<li>
						<button
							className={`menu-btn ${seccionActiva === "reportes" ? "activo" : ""}`}
							onClick={() => onNavClick("reportes")}
						>
							📊 Reportes
						</button>
					</li>
					<li>
						<button
							className={`menu-btn ${seccionActiva === "configuracion" ? "activo" : ""}`}
							onClick={() => onNavClick("configuracion")}
						>
							⚙️ Configuración
						</button>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default Sidebar;