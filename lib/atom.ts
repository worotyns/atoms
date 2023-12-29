import {
	DestructuredValue,
	IAtom,
	Identity,
	PropertiesOnly,
} from './interfaces.ts';
import { identity, isArray } from './utils.ts';

export abstract class Atom<T = unknown> implements IAtom<T> {
	public readonly identity: Identity = identity();

	static parse<T>(value: PropertiesOnly<T>): PropertiesOnly<T> {
		if (typeof value === 'string') {
			throw new Error('Cannot parse string');
		}

		return value as PropertiesOnly<T>;
	}

	static isSerializable<T = unknown>(value: unknown): value is IAtom<T> {
		return typeof value === 'object' && value !== null &&
			'destruct' in value;
	}

	static withIdentity(identity: Identity) {
		return `<@${identity}`;
	}

	public destruct(): Array<[Identity, DestructuredValue]> {
		const response: Array<[Identity, DestructuredValue]> = [];

		const temporaryObject = {} as Record<string, DestructuredValue<T>>;

		for (const [key, value] of Object.entries(this)) {
			if (isArray(value)) {
				const temporaryArray: Array<DestructuredValue<T>> = [];
				for (const item of value) {
					if (Atom.isSerializable(item)) {
						temporaryArray.push(
							Atom.withIdentity(item.identity),
						);
						response.push(...item.destruct());
					} else {
						temporaryArray.push(item as DestructuredValue<T>);
					}
				}
				temporaryObject[key] =
					temporaryArray as unknown as DestructuredValue<T>;
				continue;
			}

			if (Atom.isSerializable(value)) {
				temporaryObject[key] = Atom.withIdentity(value.identity);
				response.push(...value.destruct());
			} else {
				temporaryObject[key] = value as DestructuredValue<T>;
			}
		}

		response.push([this.identity, temporaryObject]);

		return response;
	}
}
