import { SubschemaConfig } from "@graphql-tools/delegate";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { SubschemaConfigTransform } from "@graphql-tools/stitch";
import { schemaFromExecutor } from "@graphql-tools/wrap";
import { GraphQLSchema } from "graphql";

function buildExecutor(url: string) {
  return buildHTTPExecutor({
    endpoint: url,
    fetch: async (input, init, context, info) => {
      try {
        const params = {
          method: init?.method,
          body: init?.body?.toString(),
          headers: context?.req?.headers || init?.headers,
        };

        delete params.headers.host;

        const response = await fetch(input, params);

        if (response.status > 201) {
          throw new Error("Something went wrong!");
        }

        return response as unknown as Response;
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
  });
}

export async function createRemoteSubSchema(
  url: string
): Promise<SubschemaConfig> {
  const remoteExecutor = buildExecutor(url);
  return {
    schema: await schemaFromExecutor(remoteExecutor),
    executor: remoteExecutor,
  };
}
