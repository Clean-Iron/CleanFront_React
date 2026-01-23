import React from "react";
import Link from "next/link";

const Sidebar = ({ onNavClick, seccionActiva }) => {
	return (
		<div className="menu-lateral">
			<div className="menu-buttons">
				<Link href="/menu-principal" className="btn-53">
					<div className="original">← Regresar</div>
					<div className="letters">
						<span>M</span>
						<span>E</span>
						<span>N</span>
						<span>Ú</span>
					</div>
				</Link>

				<ul>
					<li>
						<button
							className={`menu-btn ${seccionActiva === "infoGeneral" ? "activo" : ""}`}
							onClick={() => onNavClick("infoGeneral")}
						>
							ℹ️ Info General
						</button>
					</li>
					<li>
						<button
							className={`menu-btn ${seccionActiva === "listaClientes" ? "activo" : ""}`}
							onClick={() => onNavClick("listaClientes")}
						>
							👥 Lista de Clientes
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
