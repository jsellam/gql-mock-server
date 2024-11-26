export type Typedef = string;

export type Field = {
  name: string;
  type: Typedef;
  gen: string;
  description?: string;
};

export type Type = {
  name: string;
  description?: string;
  fields: Field[];
};

export type Argument = {
  name: string;
  type: Typedef;
  description?: string;
};

export type Query = {
  name: string;
  type: Typedef;
  description: string;
  arguments: Argument[];
};

export type Config = {
  remotes: string[];
  types: Type[];
  queries: Query[];
};
