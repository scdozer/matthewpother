import { Metadata } from "next";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { fetchProjects } from "../sanity/utils/queries";

export const metadata: Metadata = {
  title: "Mathew Pothier - Cinematographer",
  description:
    "Mathew Pothier is a Los Angeles based director, cinematographer and photographer. Specializing in commercial, narrative, and documentary work.",
};

export default async function HomePage() {
  const projects = await fetchProjects();

  return (
    <div>
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
