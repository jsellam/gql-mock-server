import { Query, Typedef } from "../types/config";

export function createQueriesType(queries: Query[]) {
  const typeDefs: Typedef[] = [];

  queries.forEach((query) => {
    const args = (query.arguments || [])
      .map((arg) => `${arg.name}: ${arg.type}`)
      .join(", ");
    typeDefs.push(`\n${query.name}(${args}): ${query.type}\n`);
  });

  return typeDefs;
}
