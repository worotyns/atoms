import { Path, Serialized } from '../../interfaces.ts';

export const memory = {
	__store: new Map(),
	async set(path: Path, data: Serialized): Promise<void> {
		await Promise.resolve(this.__store.set(path, data));
	},
	get(path: Path): Promise<Serialized> {
		return Promise.resolve(this.__store.get(path));
	},
};
