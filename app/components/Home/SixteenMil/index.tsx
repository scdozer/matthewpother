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
import { Projects } from "@/sanity/utils/graphql";
import * as THREE from "three";
import ProjectTimeline from "./ProjectTimeline";
import GridView from "@/app/components/GridView";
import { gsap } from "gsap";
import styles from "./styles.module.scss";
import { useRouter } from "next/navigation";
import LayeredCard from "./LayeredCards";

interface SixteenMilProps {
  projects: Projects[];
}

function ResponsiveGroup({ children }: { children: React.ReactNode }) {
  const { viewport } = useThree();
  const [scale, setScale] = useState(0);
  const groupRef = useRef<THREE.Group>(null);
  const finalScaleRef = useRef(1.5);
  const initialRotationRef = useRef({ value: 0 });
  const initialAnimationCompleteRef = useRef(false);

  useEffect(() => {
    const newScale = Math.min(viewport.width / 2.25, viewport.height / 2);
    finalScaleRef.current = newScale;

    // Create a timeline for the combined scaling and rotation animation
    const tl = gsap.timeline();

    // Add the scaling animation
    tl.to(groupRef.current!.scale, {
      x: newScale,
      y: newScale,
      z: newScale,
      duration: 2,
      delay: 1,
      ease: "power2.out",
    });

    // Add the 360-degree rotation animation
    tl.to(
      initialRotationRef.current,
      {
        value: Math.PI * 2, // 360 degrees in radians
        duration: 2,
        delay: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          if (groupRef.current) {
            groupRef.current.rotation.y = initialRotationRef.current.value;
          }
        },
        onComplete: () => {
          initialAnimationCompleteRef.current = true;
        },
      },
      "<"
    ); // Start at the same time as the scaling animation
  }, [viewport]);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      const randomOffsetX = Math.sin(time * 0.1) * 0.25;
      const randomOffsetY = Math.cos(time * 0.1) * 0.25;

      // Apply the floating animation after the initial rotation is complete
      if (initialAnimationCompleteRef.current) {
        groupRef.current.rotation.y =
          Math.sin(time * 0.3 + randomOffsetY) * 0.25 + randomOffsetY;
        groupRef.current.rotation.x =
          Math.cos(time * 0.3 + randomOffsetX) * 0.25 + randomOffsetX;
      }
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, 0.4, 0]}>
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
              <Suspense fallback={null}>
                <ResponsiveGroup>
                  <LayeredCard
                    projects={projects}
                    currentIndex={currentIndex}
                  />
                </ResponsiveGroup>
                <OrbitControls enableZoom={false} />
              </Suspense>
            </Canvas>
          </div>
          <div className="project-timeline">
            <ProjectTimeline
              projects={projects}
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
          {currentView === "3d" ? "list view" : "timeline view"}
        </button>
      )}
    </div>
  );
}
