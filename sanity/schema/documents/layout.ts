import { defineField, defineType } from "sanity";

export const layout = defineType({
  type: "document",
  name: "layout",
  title: "Layout",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "richText",
    }),
    defineField({ name: "email", title: "Email", type: "richText" }),
    defineField({ name: "address", title: "Address", type: "text" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "instagram", title: "Instagram", type: "string" }),
    defineField({ name: "extraInfo", title: "Extra Info", type: "richText" }),
    defineField({ name: "accolades", title: "Accolades", type: "richText" }),
  ],
});
