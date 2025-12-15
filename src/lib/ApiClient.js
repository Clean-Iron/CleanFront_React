import axios from 'axios';
import { logAxiosError } from './ApiErrorHelper';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
	// timeout: 15000, // opcional
});

// request: medir duración y setear request-id
api.interceptors.request.use((config) => {
	config.metadata = { start: Date.now() };
	config.headers = config.headers || {};
	config.headers['X-Request-Id'] = config.headers['X-Request-Id'] || randomReqId();
	return config;
});

// response: loguea error y lo propaga
api.interceptors.response.use(
	(res) => res,
	(error) => {
		logAxiosError(error);
		return Promise.reject(error);
	}
);

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
