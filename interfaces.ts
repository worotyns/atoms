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

type PickKeysByValue<Type, Value> = { [Key in keyof Type]: Type[Key] extends Value ? Key : never }[keyof Type];
type PickProperties<Type, Value> = Pick<Type, PickKeysByValue<Type, Value>>;
// deno-lint-ignore ban-types
type OmitFunctions<Type> = PickProperties<Type, Exclude<Type[keyof Type], Function>>;

type ExtractMapType<T> = T extends Map<infer K, infer V> ? Array<[K, OmitFunctions<V>]> : T;
type ExtractSetType<T> = T extends Set<infer S> ? Array<OmitFunctions<S>> : T;
type Properties<T> = {
  [K in keyof T]: K extends PickKeysByValue<T, Map<unknown, unknown>> 
    ? Properties<ExtractMapType<T[K]>>
    : K extends PickKeysByValue<T, Set<unknown>> 
      ? Properties<ExtractSetType<T[K]>>
      : T[K] extends Record<string, Properties<infer Z>> 
        ? Properties<T[K]>
        : T[K];
};

// deno-lint-ignore ban-types
export type PropertiesOnly<T> = PickProperties<Properties<T>, Exclude<Properties<T>[keyof Properties<T>], Function>>;