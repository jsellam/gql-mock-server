import { Field, Type, Typedef } from "../types/config";

export function createObjectType(types: Type[]): Typedef[] {
  const typeDefs: Typedef[] = [];

  types.forEach((type) => {
    const fields = type.fields
      .map((field: Field) => field.name + ":" + field.type)
      .join("\n");
    typeDefs.push(`type ${type.name} {\n${fields}\n}`);
  });

  return typeDefs;
}
