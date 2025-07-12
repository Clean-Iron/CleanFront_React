import "../styles/Inicio/ButtonInicio.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className="containerInicio">
      <Link href="/menu-principal" className="button type--A">
        <div className="button__line"></div>
        <div className="button__line"></div>
        <span className="button__text">INGRESAR</span>
        <div className="button__drow1"></div>
        <div className="button__drow2"></div>
      </Link>
    </div>
  );
}
