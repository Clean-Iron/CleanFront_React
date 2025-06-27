import React from "react";
import Link from "next/link";

const Menu = ({ onNavClick, seccionActiva }) => {
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
							className={`menu-btn ${seccionActiva === "infoServicios" ? "activo" : ""}`}
							onClick={() => onNavClick("infoServicios")}
						>
							📋 Información Tareas
						</button>
					</li>
                    <li>
						<button
							className={`menu-btn ${seccionActiva === "infoDisponibilidad" ? "activo" : ""}`}
							onClick={() => onNavClick("infoDisponibilidad")}
						>
							 Buscar Disponibilidad
						</button>
					</li>
                    <li>
						<button
							className={`menu-btn ${seccionActiva === "infoGeneral" ? "activo" : ""}`}
							onClick={() => onNavClick("editarTarea")}
						>
							📋 Editar Tarea
						</button>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default Menu;