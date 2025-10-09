'use client';

import Link from 'next/link';
import { useServiceStates } from '../lib/Hooks';
import '../styles/Inicio/ButtonInicio.css';

export default function Home() {
  const { serviceStates, isLoading, isError } = useServiceStates();

  const getData = () => {
    if (!isLoading && !isError) {
      localStorage.setItem('serviceStates', JSON.stringify(serviceStates));
    }
  };

  return (
    <div className="containerInicio">
      <Link href="/menu-principal" className="button type--A">
        <div className="button__line"></div>
        <div className="button__line"></div>
        <span className="button__text" onClick={getData}>INGRESAR</span>
        <div className="button__drow1"></div>
        <div className="button__drow2"></div>
      </Link>
    </div>
  );
}
