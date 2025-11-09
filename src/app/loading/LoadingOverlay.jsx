// components/LoadingOverlay.jsx
'use client';
import { createPortal } from 'react-dom';

const LoadingOverlay = ({ show, text = 'Cargando…', fullscreen = true }) => {
	if (!show) return null;
	const node = (
		<div className="loading-overlay" role="alert" aria-live="polite">
			<div className="loading-overlay__backdrop" />
			<div className="loading-overlay__box">
				<span className="loading-spinner" aria-hidden="true" />
				<span>{text}</span>
			</div>
		</div>
	);
	return fullscreen ? createPortal(node, document.body) : node;
};
export default LoadingOverlay;
