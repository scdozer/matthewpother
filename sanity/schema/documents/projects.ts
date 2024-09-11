import { defineField, defineType } from "sanity";

export const project = defineType({
  type: "document",
  name: "projects",
  title: "Projects",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Commercial", value: "commercial" },
          { title: "Narrative", value: "narrative" },
          { title: "Stills", value: "stills" },
          { title: "Music Video", value: "musicVideo" },
        ],
      },
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
      of: [{ type: "image" }],
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
  ],
});
