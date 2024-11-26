// import ApolloServer from "@apollo/server";

import * as fs from "fs/promises";
import yaml from "yaml";

import { stitchSchemas, ValidationLevel } from "@graphql-tools/stitch";
// import { createSchema } from "graphql-yoga";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import gen from "./gen/index";

import { makeExecutableSchema } from "@graphql-tools/schema";

import { GraphQLResolveInfo } from "graphql";
import { getTypeDetails } from "./schemaParser/getTypeDetails";
import { Config, Query, Type } from "./types/config";
import { createTypeDefs } from "./schemaParser/createTypeDefs";
import { createRemoteSubSchema } from "./server/createRemoteSubSchema";

type ResolverFunc = (
  parent: any,
  args: any,
  context: any,
  info: GraphQLResolveInfo
) => any | any[];

type Resolvers = {
  Query: Record<string, ResolverFunc>;
};

function createResolver(name: string, types: Type[]) {
  return (parent: any, args: any, context: any, info: GraphQLResolveInfo) => {
    const returnDetails = getTypeDetails(info.returnType);
    // console.log("return details", returnDetails);
    const type = types.find((type) => type.name === returnDetails.typeName);
    // console.log("return type", info.returnType);
    if (returnDetails.isList) {
      // console.log("this is a list");
      return Array.from({ length: 10 }, () => {
        const result: Record<string, any> = {};
        type?.fields.forEach((field) => {
          result[field.name] = gen(field.gen);
        });
        return result;
      });
    }
    const result: Record<string, any> = {};
    type?.fields.forEach((field) => {
      result[field.name] = gen(field.gen);
    });
    return result;
  };
}

function createQueryResolvers(queries: Query[], types: Type[]) {
  const resolvers: Resolvers = { Query: {} };
  queries.forEach((query) => {
    resolvers.Query[query.name] = createResolver(query.name, types);
  });
  return resolvers;
}

async function run() {
  const content = await fs.readFile("./gql-mock.yml", "utf-8");
  const config = yaml.parse(content) as Config;

  const typeDefs = createTypeDefs(config);
  const queryResolvers = createQueryResolvers(config.queries, config.types);

  const remotes = config.remotes.map(
    async (uri) => await createRemoteSubSchema(uri)
  );

  const schema = stitchSchemas({
    typeMergingOptions: {
      validationSettings: { validationLevel: ValidationLevel.Off },
    },
    subschemas: [
      ...(await Promise.all(remotes)),
      {
        schema: makeExecutableSchema({ typeDefs, resolvers: queryResolvers }),
      },
    ],
  });

  const server = new ApolloServer({
    schema,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async (context) => {
      return context;
    },
  });

  console.log(`🚀  Server ready at: ${url}`);
}

run();
