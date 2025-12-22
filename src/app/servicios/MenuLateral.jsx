import React from "react";
import Link from "next/link";

const Menu = ({ onNavClick, seccionActiva }) => {
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
						<Link
							href="/servicios/resumenGeneral"
							className={`menu-btn ${seccionActiva === "resumenGeneral" ? "activo" : ""}`}
						>
							📈 Resumen General
						</Link>
					</li>
					<li>
						<button
							className={`menu-btn ${seccionActiva === "infoServicios" ? "activo" : ""}`}
							onClick={() => onNavClick("infoServicios")}
						>
							📝 Información Tareas
						</button>
					</li>
					<li>
						<button
							className={`menu-btn ${seccionActiva === "infoDisponibilidad" ? "activo" : ""}`}
							onClick={() => onNavClick("infoDisponibilidad")}
						>
							🔍 Buscar Disponibilidad
						</button>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default Menu;
