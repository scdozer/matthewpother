import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import * as schemaTypes from "./sanity/schema";

export default defineConfig({
  basePath: "/studio",
  title: "Mattew Pothier",
  apiVersion: "2024-05-21",
  projectId: "bxcwz78t",
  dataset: "production",
  plugins: [structureTool()],
  schema: {
    types: Object.values(schemaTypes),
  },
});
