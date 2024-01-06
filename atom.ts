import {
  DestructuredValue,
  IAtom,
  Identity,
  PropertiesOnly,
} from './interfaces.ts';
import { identity, isArray } from './utils.ts';

export abstract class Atom<T = unknown> implements IAtom<T> {
  public readonly identity: Identity = identity();

  static parse<T>(value: object): PropertiesOnly<T> {
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

    const items = () => {
      if (this instanceof Map || this instanceof Set) {
        return this.entries();
      } else {
        return Object.entries(this);
      }
    };

    for (const [key, value] of items()) {
      if (isArray(value) || value instanceof Set) {
        const temporaryArray: Array<DestructuredValue<T>> = [];

        for (const item of Array.from(value)) {
          if (Atom.isSerializable(item)) {
            temporaryArray.push(
              Atom.withIdentity(item.identity),
            );
            response.push(...item.destruct());
          } else {
            temporaryArray.push(item as DestructuredValue<T>);
          }
        }
        temporaryObject[key] = temporaryArray;
        continue;
      }

      if (Atom.isSerializable(value)) {
        temporaryObject[key] = Atom.withIdentity(value.identity);
        response.push(...value.destruct());
      } else if (value instanceof Map) {
        const temporaryMap = [] as Array<
          [string, DestructuredValue<T>]
        >;
        for (const [key, val] of value.entries()) {
          if (Atom.isSerializable(val)) {
            temporaryMap.push([
              key,
              Atom.withIdentity(val.identity),
            ]);
            response.push(...val.destruct());
          } else {
            temporaryMap.push([key, val]);
          }
        }
        temporaryObject[key] = temporaryMap;
      } else {
        temporaryObject[key] = value;
      }
    }

    response.push([this.identity, temporaryObject]);

    return response;
  }
}
