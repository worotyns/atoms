import { Serialized } from '../../interfaces.ts';

export const json = {
  serialize<T = unknown>(data: T): Promise<Serialized> {
    return Promise.resolve(JSON.stringify(data));
  },
  deserialize<T = unknown>(data: Serialized): Promise<T> {
    return Promise.resolve(JSON.parse(data));
  },
};
