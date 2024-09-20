"use client";
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Projects } from "../../../sanity/utils/graphql";

import EndlessScrollContent from "./EndlessScroll";

interface EndlessScrollCanvasProps {
  projects: Projects[];
}

const EndlessScrollCanvas: React.FC<EndlessScrollCanvasProps> = ({
  projects,
}) => {
  return <EndlessScrollContent projects={projects} />;
};

export default EndlessScrollCanvas;
