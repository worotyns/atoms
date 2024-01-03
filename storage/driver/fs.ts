import { Path, Serialized } from '../../interfaces.ts';

export const fs = {
  async set(path: Path, data: Serialized): Promise<void> {
    await Deno.writeTextFile(path, data);
  },
  get(path: Path): Promise<Serialized> {
    return Deno.readTextFile(path);
  },
};
