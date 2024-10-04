import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  Suspense,
  useMemo,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Slideshow from "./Slideshow";
import GrainOverlay from "./Grain";
import FilmFrame from "./FilmFrame";
import { Projects } from "@/sanity/utils/graphql";
import * as THREE from "three";
import ProjectTimeline from "./ProjectTimeline";
import GridView from "../GridView";
import { gsap } from "gsap";
import styles from "./styles.module.scss";
import { useRouter } from "next/navigation";

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
        Math.sin(state.clock.elapsedTime * 0.3) * 0.25;
      groupRef.current.rotation.x =
        Math.cos(state.clock.elapsedTime * 0.3) * 0.25;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, 0.5, 0]}>
      {children}
    </group>
  );
}

export default function SixteenMil({ projects }: SixteenMilProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentView, setCurrentView] = useState<"3d" | "grid">("3d");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const featuredProjects = useMemo(
    () => projects.filter((project) => project.featured),
    [projects]
  );

  const handleProjectChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleViewChange = () => {
    setIsTransitioning(true);
  };

  const handleTransitionComplete = (view: "3d" | "grid") => {
    setCurrentView(view);
    setIsTransitioning(false);
  };

  const animate3DOut = () => {
    const tl = gsap.timeline();
    tl.to(".canvas-container", { opacity: 0, duration: 0.5 });
    tl.to(".project-timeline", { opacity: 0, y: 50, duration: 0.5 }, "-=0.3");
    return tl;
  };

  const handleProjectNavigation = (slug: string) => {
    setIsNavigating(true);
    animate3DOut().then(() => {
      router.push(`/projects/${slug}`);
    });
  };

  useEffect(() => {
    if (isTransitioning && !isNavigating) {
      if (currentView === "3d") {
        animate3DOut().then(() => handleTransitionComplete("grid"));
      } else {
        setTimeout(() => {
          handleTransitionComplete("3d");
        }, 1000);
      }
    }
  }, [isTransitioning, currentView, isNavigating]);

  return (
    <div className={styles.container}>
      {currentView === "3d" && (
        <>
          <div className="canvas-container">
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={0.8} />
              <Suspense fallback={null}>
                <ResponsiveGroup>
                  <FilmFrame position={[0, 0, -0.05]} />
                  <GrainOverlay position={[0, 0, -0.05]} />
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
          </div>
          <div className="project-timeline">
            <ProjectTimeline
              projects={featuredProjects}
              currentIndex={currentIndex}
              onProjectChange={handleProjectChange}
              onProjectNavigation={handleProjectNavigation}
            />
          </div>
        </>
      )}
      {currentView === "grid" && !isNavigating && (
        <GridView
          projects={projects}
          isTransitioning={isTransitioning}
          onTransitionComplete={() => handleTransitionComplete("3d")}
        />
      )}
      {!isNavigating && (
        <button className={styles.viewToggle} onClick={handleViewChange}>
          {currentView === "3d" ? "All Projects" : "View Selects"}
        </button>
      )}
    </div>
  );
}
