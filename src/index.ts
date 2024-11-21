// import ApolloServer from "@apollo/server";

import fs from "fs/promises";
import yaml from "yaml";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { stitchSchemas } from "@graphql-tools/stitch";
import { createSchema } from "graphql-yoga";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import {
  RenameRootFields,
  RenameTypes,
  schemaFromExecutor,
} from "@graphql-tools/wrap";

type Field = {
  name: string;
  type: string;
  faker: string;
  description?: string;
};

type Type = {
  name: string;
  description?: string;
  fields: Field[];
};

type Config = {
  remote: string[];
  types: Type[];
  queries: Query[];
};

type Typedef = string;

type Argument = {
  name: string;
  type: string;
  description?: string;
};

type Query = {
  name: string;
  type: string;
  description: string;
  arguments: Argument[];
};

function createObjectType(types: Type[]): Typedef[] {
  const typeDefs: Typedef[] = [];

  types.forEach((type) => {
    const fields = type.fields
      .map((field: Field) => field.name + ":" + field.type)
      .join("\n");
    typeDefs.push(`type ${type.name} {\n${fields}\n}`);
  });

  return typeDefs;
}

function createQueriesType(queries: Query[]) {
  const typeDefs: Typedef[] = [];
  queries.forEach((query) => {
    const args = (query.arguments || [])
      .map((arg) => `${arg.name}: ${arg.type}`)
      .join(", ");
    typeDefs.push(`\n${query.name}(${args}): ${query.type}\n`);
  });

  console.log(typeDefs);

  return typeDefs;
}

function createTypeDefs(config: Config): string {
  const objectTypes = createObjectType(config.types);
  const queryTypes = createQueriesType(config.queries);

  return `
    ${objectTypes}

    type Query {
            ${queryTypes}
        }
  `;
}

async function run() {
  const content = await fs.readFile("./gql-mock.yml", "utf-8");
  const config = yaml.parse(content) as Config;

  const typeDefs = createTypeDefs(config);

  const remoteExec = buildHTTPExecutor({
    endpoint: "https://api.dev.ked.southpigalle.io/graphql",
    disposable: true,
    fetch: async (url: string, options?: RequestInit, context?: any) => {
      return {};
    },
  });

  const schema = stitchSchemas({
    subschemas: [
      {
        schema: await schemaFromExecutor(remoteExec),
        executor: remoteExec,
      },
      {
        schema: createSchema({ typeDefs, resolvers: { Query: {} } }),
      },
    ],
  });

  const server = new ApolloServer({
    schema,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
}

run();
