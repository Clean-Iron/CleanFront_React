export const logAxiosError = (err, ctx = '') => {
	const cfg = err?.config || {};
	const method = (cfg.method || 'GET').toUpperCase();
	const url = `${cfg.baseURL || ''}${cfg.url || ''}`;

	const status = err?.response?.status;
	const statusText = err?.response?.statusText;
	const duration = cfg.metadata?.start ? Date.now() - cfg.metadata.start : undefined;

	const reqId =
		cfg.headers?.['X-Request-Id'] ||
		err?.response?.headers?.['x-request-id'] ||
		cfg.headers?.['x-request-id'];

	const query = cfg.params || {};
	const respData = err?.response?.data;

	const serverMsg = typeof respData === 'string'
		? respData
		: (respData?.message || respData?.error || respData?.detail || respData?.title);

	const validation = respData?.errors || respData?.violations;

	const net =
		err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '') ? 'timeout'
			: !err?.response ? 'network'
				: 'http';

	const rawPayload = safeJson(cfg.data);

	const isSensitive =
		(ctx || '').toLowerCase() === 'login' ||
		!!cfg.metadata?.sensitive ||
		/\/auth\/login\b/i.test(cfg.url || '');

	const payload = isSensitive ? '[REDACTED]' : sanitizeSensitive(rawPayload);

	const log = {
		ctx, net, method, url, status, statusText,
		code: err?.code, duration, reqId,
		query, payload, serverMsg, validation,
	};

	console.groupCollapsed(
		`%cAPI %s %s → %s %s`,
		'color:#f43f5e;font-weight:600',
		method, url, status ?? 'ERR', statusText ?? ''
	);
	if (ctx) console.log('Contexto:', ctx);
	if (reqId) console.log('X-Request-Id:', reqId);
	if (duration != null) console.log('Duración (ms):', duration);
	console.log('Query params:', query);
	console.log('Payload:', payload);
	console.log('Respuesta (data):', respData);
	if (validation) console.log('Validaciones:', validation);
	if (err?.stack) console.log('Stack:', err.stack);
	console.groupEnd();

	return log;
};

export const safeApi = async (promise, ctx = '') => {
	try {
		const { data } = await promise;
		return data;
	} catch (e) {
		logAxiosError(e, ctx);
		throw e;
	}
};

// ---------- Helpers ----------
const safeJson = (data) => {
	try {
		const obj = typeof data === 'string' ? JSON.parse(data) : data;
		return trimBig(obj);
	} catch {
		return data;
	}
};

const trimBig = (obj, depth = 0) => {
	if (depth > 4) return '[max-depth]';
	if (obj && typeof obj === 'object') {
		if (Array.isArray(obj)) return obj.slice(0, 20).map(x => trimBig(x, depth + 1));
		const out = {};
		for (const k of Object.keys(obj).slice(0, 50)) {
			out[k] = trimBig(obj[k], depth + 1);
		}
		return out;
	}
	if (typeof obj === 'string' && obj.length > 300) return obj.slice(0, 300) + '…';
	return obj;
};

const SENSITIVE_KEYS = new Set([
	'password', 'pass', 'pwd',
	'token', 'accessToken', 'refreshToken', 'idToken',
	'authorization', 'client_secret', 'secret'
]);

function sanitizeSensitive(input) {
	return redactDeep(input);
}

function redactDeep(value, seen = new WeakSet(), depth = 0) {
	if (depth > 6) return '[max-depth]';
	if (value == null) return value;
	if (typeof value !== 'object') return value;

	if (seen.has(value)) return '[circular]';
	seen.add(value);

	if (Array.isArray(value)) return value.map(v => redactDeep(v, seen, depth + 1));

	const out = {};
	for (const key of Object.keys(value)) {
		const lower = String(key).toLowerCase();
		const isSensitiveKey =
			SENSITIVE_KEYS.has(key) ||
			SENSITIVE_KEYS.has(lower) ||
			lower.includes('password') ||
			lower.includes('token') ||
			lower.includes('secret') ||
			lower.includes('authorization');

		out[key] = isSensitiveKey ? '[REDACTED]' : redactDeep(value[key], seen, depth + 1);
	}
	return out;
}