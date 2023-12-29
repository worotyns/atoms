export function relative(...path: string[]) {
	const last = path.pop();
	return last?.startsWith('.')
		? [...path].join('/') + last
		: [...path, last].join('/');
}

export function isArray(item: unknown): boolean {
	return Array.isArray(item);
}

export function isObject(item: unknown): boolean {
	return item !== null && typeof item === 'object';
}

export function identity(): string {
	return [
		Math.random().toString(36).slice(2).substring(0, 4),
		Math.random().toString(36).slice(2).substring(0, 4),
		Math.random().toString(36).slice(2).substring(0, 2),
	].join('');
}
