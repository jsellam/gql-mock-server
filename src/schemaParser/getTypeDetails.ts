import {
  GraphQLOutputType,
  isListType,
  isNamedType,
  isNonNullType,
} from "graphql";

export function getTypeDetails(graphqlType: GraphQLOutputType) {
  let isList = false;
  let isNonNull = false;
  let typeName = "";

  let currentType = graphqlType;

  while (currentType) {
    if (isNonNullType(currentType)) {
      isNonNull = true;
    }

    if (isListType(currentType)) {
      isList = true;
    }

    if (isNamedType(currentType)) {
      typeName = currentType.name;
      break;
    }
  }

  return { isList, isNonNull, typeName };
}
