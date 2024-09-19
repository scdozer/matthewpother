import { defineField, defineType } from "sanity";

export const layout = defineType({
  type: "document",
  name: "layout",
  title: "Layout",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().error("Field is required."),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "richText",
      validation: (Rule) => Rule.required().error("Field is required."),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required().error("Field is required."),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().error("Field is required."),
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "text",
      validation: (Rule) => Rule.required().error("Field is required."),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      validation: (Rule) => Rule.required().error("Field is required."),
    }),
    defineField({
      name: "instagram",
      title: "Instagram",
      type: "string",
      validation: (Rule) => Rule.required().error("Field is required."),
    }),
    defineField({
      name: "extraInfo",
      title: "Extra Info",
      type: "richText",
      validation: (Rule) => Rule.required().error("Field is required."),
    }),
    defineField({ name: "accolades", title: "Accolades", type: "richText" }),
  ],
});
