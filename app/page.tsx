import { Metadata } from "next";
import { fetchProjects } from "../sanity/utils/queries";

import Home from "./components/Home";

export const metadata: Metadata = {
  title: "Matthew Pothier - Cinematographer",
  description:
    "Matthew Pothier is a Los Angeles based director, cinematographer and photographer. Specializing in commercial, narrative, and documentary work.",
};

export default async function HomePage() {
  const projects = await fetchProjects();

  return <Home projects={projects} />;
}
