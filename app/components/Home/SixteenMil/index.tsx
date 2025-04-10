import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  Suspense,
  useMemo,
  useEffect,
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
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

// Define the interface for the ref
interface ResponsiveGroupRef {
  handleInteractionStart: () => void;
  handleInteractionEnd: () => void;
}

// Create the ResponsiveGroup component with forwardRef
const ResponsiveGroup = forwardRef<
  ResponsiveGroupRef,
  { children: React.ReactNode }
>((props, ref) => {
  const { children } = props;
  const { viewport } = useThree();
  const [scale, setScale] = useState(0);
  const groupRef = useRef<THREE.Group>(null);
  const finalScaleRef = useRef(1.5);
  const animationStartTimeRef = useRef(0);
  const initialAnimationDurationRef = useRef(3); // 2s duration + 1s delay
  const transitionDurationRef = useRef(1); // Duration of the transition between initial rotation and floating
  const isInteractingRef = useRef(false);
  const interactionScaleRef = useRef(2); // Scale factor during interaction

  useEffect(() => {
    const newScale = Math.min(viewport.width / 2.25, viewport.height / 2);
    finalScaleRef.current = newScale;

    // Create a timeline for the scaling animation
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

    // Record the time when the animation starts
    animationStartTimeRef.current = performance.now();
  }, [viewport]);

  // Function to handle interaction start
  const handleInteractionStart = useCallback(() => {
    isInteractingRef.current = true;
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: finalScaleRef.current * interactionScaleRef.current,
        y: finalScaleRef.current * interactionScaleRef.current,
        z: finalScaleRef.current * interactionScaleRef.current,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, []);

  // Function to handle interaction end
  const handleInteractionEnd = useCallback(() => {
    isInteractingRef.current = false;
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: finalScaleRef.current,
        y: finalScaleRef.current,
        z: finalScaleRef.current,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
    }
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Calculate elapsed time since the animation started
      const elapsedTime =
        (performance.now() - animationStartTimeRef.current) / 1000;

      // Calculate the rotation based on elapsed time
      if (elapsedTime < initialAnimationDurationRef.current) {
        // During the initial animation period (scaling + 360 rotation)
        const progress = elapsedTime / initialAnimationDurationRef.current;

        // Apply the 360-degree rotation - clean rotation without random offsets
        groupRef.current.rotation.y = progress * Math.PI * 2;
        groupRef.current.rotation.x = 0;
      } else if (
        elapsedTime <
        initialAnimationDurationRef.current + transitionDurationRef.current
      ) {
        // During the transition period, smoothly interpolate between initial rotation and floating
        const transitionProgress =
          (elapsedTime - initialAnimationDurationRef.current) /
          transitionDurationRef.current;

        // Calculate the target floating values
        const floatingTime = 0; // Start from the beginning of the floating animation
        const randomOffsetX = Math.sin(floatingTime * 0.1) * 0.25;
        const randomOffsetY = Math.cos(floatingTime * 0.1) * 0.25;

        const targetY =
          Math.PI * 2 +
          Math.sin(floatingTime * 0.3 + randomOffsetY) * 0.25 +
          randomOffsetY;
        const targetX =
          Math.cos(floatingTime * 0.3 + randomOffsetX) * 0.25 + randomOffsetX;

        // Smoothly interpolate from the final position of the initial rotation to the target floating position
        groupRef.current.rotation.y =
          Math.PI * 2 + (targetY - Math.PI * 2) * transitionProgress;
        groupRef.current.rotation.x = targetX * transitionProgress;
      } else {
        // After the transition, apply the floating effect
        const floatingTime =
          elapsedTime -
          (initialAnimationDurationRef.current + transitionDurationRef.current);

        // Calculate the floating animation values
        const randomOffsetX = Math.sin(floatingTime * 0.1) * 0.25;
        const randomOffsetY = Math.cos(floatingTime * 0.1) * 0.25;

        // Apply the floating animation
        groupRef.current.rotation.y =
          Math.PI * 2 +
          Math.sin(floatingTime * 0.3 + randomOffsetY) * 0.25 +
          randomOffsetY;
        groupRef.current.rotation.x =
          Math.cos(floatingTime * 0.3 + randomOffsetX) * 0.25 + randomOffsetX;
      }
    }
  });

  // Expose the interaction handlers to the parent component
  useImperativeHandle(
    ref,
    () => ({
      handleInteractionStart,
      handleInteractionEnd,
    }),
    [handleInteractionStart, handleInteractionEnd]
  );

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, 0.5, 0]}>
      {children}
    </group>
  );
});

// Set display name for debugging
ResponsiveGroup.displayName = "ResponsiveGroup";

export default function SixteenMil({ projects }: SixteenMilProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentView, setCurrentView] = useState<"3d" | "grid">("3d");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const orbitControlsRef = useRef<any>(null);
  const responsiveGroupRef = useRef<ResponsiveGroupRef>(null);

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

  // Handle OrbitControls interaction
  const handleOrbitControlsStart = useCallback(() => {
    if (responsiveGroupRef.current?.handleInteractionStart) {
      responsiveGroupRef.current.handleInteractionStart();
    }
  }, []);

  const handleOrbitControlsEnd = useCallback(() => {
    if (responsiveGroupRef.current?.handleInteractionEnd) {
      responsiveGroupRef.current.handleInteractionEnd();
    }
  }, []);

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
                <ResponsiveGroup ref={responsiveGroupRef}>
                  <LayeredCard
                    projects={projects}
                    currentIndex={currentIndex}
                  />
                </ResponsiveGroup>
                <OrbitControls
                  ref={orbitControlsRef}
                  enableZoom={false}
                  onStart={handleOrbitControlsStart}
                  onEnd={handleOrbitControlsEnd}
                />
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
