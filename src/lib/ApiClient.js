import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
	timeout: 15000,
});

// request: medir duración, request-id, y token
api.interceptors.request.use((config) => {
	config.metadata = { start: Date.now() };
	config.headers = config.headers || {};
	config.headers['X-Request-Id'] = config.headers['X-Request-Id'] || randomReqId();

	const url = (config.url || '').toString();
	const isAuthLogin = url.startsWith('/auth/login');

	// 👇 marca como sensible para que el logger lo oculte
	if (isAuthLogin) {
		config.metadata.sensitive = true;
	}

	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('token');

		const expiresAt = localStorage.getItem('expiresAt');
		if (expiresAt && Date.now() >= Date.parse(expiresAt)) {
			clearSessionAndRedirect('session');
			return config;
		}

		if (token && !isAuthLogin) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}

	return config;
});


// response: maneja 401/403 y timeout/red
api.interceptors.response.use(
	(res) => res,
	(error) => {
		const cfg = error?.config || {};
		const url = cfg.url || '';
		const status = error?.response?.status;

		const isAuthEndpoint =
			url.includes('/auth/login') || url.includes('/auth/register');

		if (!isAuthEndpoint && (status === 401 || status === 403)) {
			try {
				localStorage.removeItem('token');
				localStorage.removeItem('expiresAt');
				localStorage.removeItem('authUser');
			} catch { }

			// Redirección por sesión expirada SOLO fuera de login/register
			if (typeof window !== 'undefined') {
				window.location.assign('/?reason=session');
			}
		}

		return Promise.reject(error);
	}
);

const clearSessionAndRedirect = (reason) => {
	try {
		localStorage.removeItem('token');
		localStorage.removeItem('expiresAt');
		localStorage.removeItem('authUser');
	} catch { }

	window.location.assign(`/?reason=${encodeURIComponent(reason)}`);
};

const randomReqId = () => {
	try {
		if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
			const buf = new Uint32Array(2);
			crypto.getRandomValues(buf);
			return `req_${buf[0].toString(16)}${buf[1].toString(16)}`;
		}
	} catch { }
	return `req_${Math.random().toString(16).slice(2)}`;
};
