export type Identity = string;
export type LinkReference = string;
export type DestructuredValue<T = unknown> =
  | PropertiesOnly<T>
  | LinkReference
  | DestructuredValue<T>[];

export interface AtomClassWithDestructor<T = unknown> {
  new (): T;
  deserialize(value: PropertiesOnly<T>): T;
}

export interface IAtom<T> {
  destruct(): Array<[Identity, DestructuredValue]>;
  identity: Identity;
}

export type Serialized = string;
export type Path = string;

export interface Serializer {
  serialize<T = unknown>(data: T): Promise<Serialized>;
  deserialize<T = unknown>(data: Serialized): Promise<T>;
}

export interface StorageDriver {
  set(path: Path, data: Serialized): Promise<void>;
  get(path: Path): Promise<Serialized>;
}

export type PersistOptions = {
  storageDriver: StorageDriver;
  serializer: Serializer;
};

export type PropertiesOnly<T> = Pick<
  T,
  // deno-lint-ignore ban-types
  { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
>;
