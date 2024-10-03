"use client";
import { Projects } from "../../../sanity/utils/graphql";
import SixteenMil from "../Home/SixteenMil";

interface EndlessScrollCanvasProps {
  projects: Projects[];
}

const EndlessScrollCanvas: React.FC<EndlessScrollCanvasProps> = ({
  projects,
}) => {
  return <SixteenMil projects={projects} />;
};

export default EndlessScrollCanvas;
