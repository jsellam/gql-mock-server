import { Config } from "../types/config";
import { createObjectType } from "./createObjectType";
import { createQueriesType } from "./createQueriesType";

export function createTypeDefs(config: Config): string {
  const objectTypes = createObjectType(config.types);
  const queryTypes = createQueriesType(config.queries);

  return `
    ${objectTypes}

    type Query {
            ${queryTypes}
        }
  `;
}
