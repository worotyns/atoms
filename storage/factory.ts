import {
  DestructuredValue,
  PersistOptions,
  PropertiesOnly,
} from '../interfaces.ts';
import { AtomClassWithDestructor, IAtom, Identity } from '../interfaces.ts';
import { isArray, relative } from '../utils.ts';
import { fs } from './driver/fs.ts';
import { memory } from './driver/memory.ts';
import { json } from './serializer/json.ts';

function storeFactory(rootPath: string, options: PersistOptions) {
  return {
    async persist<T = unknown>(
      object: IAtom<T>,
    ): Promise<void> {
      for (const [identity, value] of object.destruct()) {
        await options.storageDriver.set(
          relative(rootPath, identity),
          await options.serializer.serialize(value),
        );
      }
    },
    async restore<T>(
      path: Identity,
      Class: AtomClassWithDestructor<T>,
    ): Promise<T> {
      const temporary = await options.storageDriver.get(
        relative(rootPath, path),
      );

      const rawObject: PropertiesOnly<T> = await options.serializer
        .deserialize(temporary);

      async function serializeArray(
        value: unknown[],
      ): Promise<unknown[]> {
        const temporaryArray = [];

        for (const item of value as DestructuredValue[]) {
          if (isArray(item)) {
            temporaryArray.push(
              await serializeArray(item as unknown[]),
            );
          } else if (
            typeof item === 'string' && item.startsWith('<@')
          ) {
            temporaryArray.push(
              await options.serializer.deserialize(
                await options.storageDriver.get(
                  relative(rootPath, item.slice(2)),
                ),
              ),
            );
          } else {
            temporaryArray.push(item);
          }
        }

        return temporaryArray;
      }

      // Always serialize object (extends of Atom) must be an object
      for (const [key, value] of Object.entries(rawObject)) {
        if (isArray(value)) {
          const temporaryArray: Array<unknown> = await serializeArray(
            value as unknown[],
          );

          rawObject[key as keyof PropertiesOnly<T>] =
            temporaryArray as unknown as PropertiesOnly<
              T
            >[keyof PropertiesOnly<T>];
          continue;
        }
        if (typeof value === 'string' && value.startsWith('<@')) {
          rawObject[key as keyof PropertiesOnly<T>] = await options
            .serializer.deserialize(
              await options.storageDriver.get(
                relative(rootPath, value.slice(2)),
              ),
            );
        }
      }

      return Class.deserialize(rawObject as PropertiesOnly<T>);
    },
  };
}

export function createFs(rootPath: string) {
  return storeFactory(rootPath, {
    serializer: json,
    storageDriver: fs,
  });
}

export function createMemory(rootPath = '/tmp') {
  return {
    data: memory.__store,
    ...storeFactory(rootPath, {
      serializer: json,
      storageDriver: memory,
    }),
  };
}
