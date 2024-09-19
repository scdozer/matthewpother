import { Metadata, ResolvingMetadata } from "next";
import { PortableText } from "@portabletext/react";
import {
  fetchProjects,
  fetchSingleProject,
} from "../../../sanity/utils/queries";

export async function generateStaticParams() {
  const projects = await fetchProjects();
  return projects.map((project) => ({
    slug: project?.slug?.current,
  }));
}

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const project = await fetchSingleProject(params.slug);

  return {
    title: `Mathew Pothier - ${project?.title || "Project"}`,
    description:
      "Mathew Pothier is a Los Angeles based cinematographer and director of photography, specializing in commercial, narrative, and documentary work.",
  };
}

export default async function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await fetchSingleProject(params.slug);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div>
      <h1>{project.title}</h1>
      <PortableText value={project.descriptionRaw} />
      {project.image?.asset?.url && (
        <img src={project.image.asset.url} alt={project.title || ""} />
      )}
      {/* Render other project details */}
    </div>
  );
}
