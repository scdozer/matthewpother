import { defineField, defineType } from "sanity";

export const project = defineType({
  type: "document",
  name: "projects",
  title: "Projects",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().error("Field is required."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required().error("Field is required."),
    }),
    defineField({
      name: "image",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required().error("Field is required."),
    }),
    defineField({
      name: "mainVideo",
      title: "Main Video",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Commercial", value: "commercial" },
          { title: "Narrative", value: "narrative" },
          { title: "Music Video", value: "musicVideo" },
          { title: "Docs", value: "Docs" },
          { title: "Stills", value: "stills" },
        ],
      },
      validation: (Rule) => Rule.required().error("Field is required."),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "richText",
    }),
    {
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        { type: "image", options: { hotspot: true } },
        { type: "file", options: { accept: "video/*" } },
      ],
      options: {
        layout: "grid",
      },
    },
    defineField({
      name: "videoEmbed",
      title: "Video Embed",
      type: "url",
      description: "Vimeo or YouTube URL",
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      validation: (Rule) =>
        Rule.custom(async (value, context) => {
          if (!value) return true;

          const featuredCount = await context
            .getClient({ apiVersion: "2023-05-03" })
            .fetch(
              `count(*[_type == "project" && featured == true && _id != $id])`,
              { id: context.document?._id }
            );

          if (featuredCount >= 8) {
            return "Only 8 projects can be featured at a time";
          }
          return true;
        }),
    }),
  ],
});
