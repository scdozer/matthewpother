import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useEffect, useState, useRef } from "react";
import { OrbitControls, PerspectiveCamera, Loader } from "@react-three/drei";
import Slideshow from "./Slideshow";
import GrainOverlay from "./Grain";
import FilmFrame from "./FilmFrame";
import { Projects } from "@/sanity/utils/graphql";
import * as THREE from "three";
import ProjectTimeline from "./ProjectTimeline";
import { gsap } from "gsap";

interface SixteenMilProps {
  projects: Projects[];
}

function ResponsiveGroup({ children }: { children: React.ReactNode }) {
  const { viewport } = useThree();
  const [scale, setScale] = useState(0);
  const groupRef = useRef<THREE.Group>(null);
  const finalScaleRef = useRef(1.5);

  useEffect(() => {
    const newScale = Math.min(viewport.width / 2.25, viewport.height / 2);
    finalScaleRef.current = newScale;

    gsap.to(groupRef.current!.scale, {
      x: newScale,
      y: newScale,
      z: newScale,
      duration: 2,
      delay: 1,
      ease: "power2.out",
      //   onUpdate: () => {
      //     setScale(groupRef.current!.scale.x);
      //   },
    });
  }, [viewport]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.25;
      groupRef.current.rotation.x =
        Math.cos(state.clock.elapsedTime * 0.2) * 0.25;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, 0.5, 0]}>
      {children}
    </group>
  );
}

export default function SixteenMil({ projects }: SixteenMilProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredProjects = useMemo(
    () => projects.filter((project) => project.featured),
    [projects]
  );

  const handleProjectChange = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <Suspense fallback={null}>
          <ResponsiveGroup>
            <Slideshow
              projects={featuredProjects}
              currentIndex={currentIndex}
            />
            <GrainOverlay />
            <FilmFrame />
          </ResponsiveGroup>
          <OrbitControls enableZoom={false} />
        </Suspense>
      </Canvas>
      <ProjectTimeline
        projects={featuredProjects}
        currentIndex={currentIndex}
        onProjectChange={handleProjectChange}
      />
    </div>
  );
}
