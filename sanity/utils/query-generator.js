const { parse, print } = require("graphql");

const minimalImageFields = `
  _key
  _type
  originalFilename
  path
  title
  uploadId
  url
  hotspot {
    _key
    _type
    height
    width
    x
    y
  }
`;

const generateAllFieldsSelection = (fields, typeName) => {
  return fields
    .map((field) => {
      const fieldType = field.type.ofType || field.type; // Handle list types or non-nullable types

      // Customize fields for specific types, e.g., 'Image'
      if (typeName === "Image" && field.name === "asset") {
        return `asset {
          ${minimalImageFields}
        }`;
      }

      if (fieldType.getFields) {
        // For nested object types, recursively generate fields
        return `${field.name} {
          ${generateAllFieldsSelection(Object.values(fieldType.getFields()), fieldType.name)}
        }`;
      }

      return field.name; // For scalar types, return the field name
    })
    .join("\n");
};

const isRootQueryField = (field) => {
  const fieldName = field.name;
  return fieldName.startsWith("all") && fieldName.length > 3;
};

const unwrapType = (type) => {
  let unwrappedType = type;
  while (unwrappedType.ofType) {
    unwrappedType = unwrappedType.ofType;
  }
  return unwrappedType;
};

module.exports = {
  plugin: (schema) => {
    const queries = [];

    const rootQueryType = schema.getQueryType();
    if (!rootQueryType) {
      console.error("No root query type found in the schema");
      return "";
    }

    const fields = rootQueryType.getFields();

    Object.values(fields).forEach((field) => {
      if (isRootQueryField(field)) {
        const typeName = field.name.replace("all", "");
        const unwrappedType = unwrapType(field.type);

        console.log(
          `Field type of ${field.name}: ${unwrappedType.name || unwrappedType}`
        );

        // Ensure it's an object type that has fields
        if (unwrappedType.getFields) {
          const allFields = Object.values(unwrappedType.getFields());

          // Generate query for fetching all documents of this type
          const queryAll = `
            query getAll${typeName}s {
              ${field.name} {
                ${generateAllFieldsSelection(allFields, unwrappedType.name)}
              }
            }
          `;
          queries.push(parse(queryAll)); // Ensure proper AST node parsing

          // Generate query for fetching a document by ID
          const queryById = `
            query get${typeName}ById($id: ID!) {
              ${typeName}(id: $id) {
                ${generateAllFieldsSelection(allFields, unwrappedType.name)}
              }
            }
          `;
          queries.push(parse(queryById)); // Ensure proper AST node parsing
        } else {
          console.log(
            `Skipping ${field.name} because it does not have getFields`
          );
        }
      }
    });

    // Return queries as valid AST nodes
    return queries.length > 0
      ? queries.map((query) => print(query)).join("\n\n")
      : "";
  },
};
