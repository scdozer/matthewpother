import { Metadata, ResolvingMetadata } from "next";
import {
  fetchProjects,
  fetchSingleProject,
} from "../../../sanity/utils/queries";

import Project from "../../components/Project";

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
    title: `Matthew Pothier - ${project?.title || "Project"}`,
    description:
      "Matthew Pothier is a Los Angeles based cinematographer and director of photography, specializing in commercial, narrative, and documentary work.",
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

  return <Project project={project} />;
}
