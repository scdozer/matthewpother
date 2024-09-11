import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import * as schemaTypes from "./sanity/schema";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineConfig({
  basePath: "/studio",
  title: "Mattew Pothier",
  apiVersion: "2024-05-21",
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {
    types: Object.values(schemaTypes),
  },
});
