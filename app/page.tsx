import { Metadata } from "next";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { fetchLayout, fetchProjects } from "../sanity/utils/queries";

async function getHomePageData() {
  const layout = await fetchLayout();
  const projects = await fetchProjects();
  return { layout, projects };
}

export const metadata: Metadata = {
  title: "Mathew Pothier - Cinematographer",
  description:
    "Mathew Pothier is a Los Angeles based cinematographer and director of photography, specializing in commercial, narrative, and documentary work.",
};

export default async function HomePage() {
  const { layout, projects } = await getHomePageData();

  return (
    <div>
      <h1>{layout.title}</h1>
      <PortableText value={layout.descriptionRaw} />
      <div>
        {projects.map((project) => (
          <div key={project._id}>
            <h2>{project.title}</h2>
            <PortableText value={project.descriptionRaw} />
            {project.image?.asset?.url && (
              <img src={project.image.asset.url} alt={project.title || ""} />
            )}
            <Link href={`/projects/${project?.slug?.current}`}>
              View Project
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
