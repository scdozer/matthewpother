import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Projects } from "@/sanity/utils/graphql";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./styles.module.scss";

gsap.registerPlugin(ScrollTrigger);

// Helper function to generate a tiny placeholder image URL from Sanity image URL
const getBlurDataURL = (imageUrl: string): string => {
  if (!imageUrl) return "";

  // For Sanity images, we can use their built-in image transformation API
  // This creates a tiny, blurred version of the image
  const url = new URL(imageUrl);
  const params = new URLSearchParams(url.search);

  // Add parameters for a tiny, blurred image
  params.set("w", "10"); // Width of 10px
  params.set("blur", "10"); // Blur effect
  params.set("q", "10"); // Low quality

  url.search = params.toString();
  return url.toString();
};

const TYPES_MAP = {
  Docs: "Documentaries",
  narrative: "Narratives",
  musicVideo: "Music Videos",
  commercial: "Commercial",
  stills: "Stills",
};

interface GridViewProps {
  projects: Projects[];
  isTransitioning: boolean;
  onTransitionComplete: (view: "grid" | "scroll") => void;
}

const GridView: React.FC<GridViewProps> = ({
  projects,
  isTransitioning,
  onTransitionComplete,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridProjectsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<Projects | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const hoverImageRef = useRef<HTMLDivElement>(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isTransitioning) {
      gsap.to(gridRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        onComplete: () => onTransitionComplete("scroll"),
      });
      return;
    }

    // Set up ScrollTrigger defaults to use the grid container as the scroller
    ScrollTrigger.defaults({ scroller: gridRef.current });

    // Get all project elements
    const projectElements = gsap.utils.toArray<HTMLElement>(".gridProject");

    // Set initial state for all projects
    gsap.set(projectElements, { opacity: 0, y: 20 });

    // Create a timeline for the initial stagger animation
    const initialTimeline = gsap.timeline();

    // Find elements that are initially in viewport
    const initialElements = projectElements.filter((el) =>
      ScrollTrigger.isInViewport(el, 0.1)
    );

    // Animate initial elements with stagger
    if (initialElements.length > 0) {
      initialTimeline.to(initialElements, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    }

    // Set up scroll triggers for all projects
    projectElements.forEach((project, index) => {
      ScrollTrigger.create({
        trigger: project,
        start: "top 90%", // Start animation earlier
        end: "top 10%", // End animation later
        toggleActions: "play none none reverse", // Play on enter, reverse on leave
        onEnter: () => {
          gsap.to(project, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        },
        onLeave: () => {
          gsap.to(project, {
            opacity: 0,
            y: 20,
            duration: 0.5,
          });
        },
        onEnterBack: () => {
          gsap.to(project, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        },
        onLeaveBack: () => {
          gsap.to(project, {
            opacity: 0,
            y: 20,
            duration: 0.5,
          });
        },
      });
    });

    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      ScrollTrigger.defaults({ scroller: window });
    };
  }, [isTransitioning, onTransitionComplete]);

  // Handle mouse movement for hover image
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse movement speed
      const dx = e.clientX - lastMousePosition.current.x;
      const dy = e.clientY - lastMousePosition.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Update last position
      lastMousePosition.current = { x: e.clientX, y: e.clientY };

      // Update mouse position
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Add animation effects based on mouse movement
      if (hoveredProject && hoverImageRef.current) {
        // Scale effect based on speed
        const newScale = Math.min(1 + speed * 0.01, 1.2);
        setImageScale(newScale);

        // Rotation effect based on horizontal movement
        const newRotation = dx * 0.1;
        setImageRotation(newRotation);

        // Animate the image with GSAP
        gsap.to(hoverImageRef.current, {
          scale: newScale,
          rotation: newRotation,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hoveredProject]);

  // Reset animation when hover ends
  useEffect(() => {
    if (!hoveredProject && hoverImageRef.current) {
      gsap.to(hoverImageRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });
      setImageScale(1);
      setImageRotation(0);
    }
  }, [hoveredProject]);

  const handleProjectClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    if (isNavigating) return;

    setIsNavigating(true);

    gsap.to(gridRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      onComplete: () => {
        setIsNavigating(false);
        router.push(href);
      },
    });
  };

  const handleProjectHover = (project: Projects | null) => {
    setHoveredProject(project);
  };

  return (
    <div ref={gridRef} className={styles.gridElement}>
      <div ref={gridProjectsRef} className={styles.gridProjects}>
        {projects.map((project) => (
          <Link
            href={`/projects/${project.slug?.current}`}
            key={project.title}
            className={`${styles.gridProject} gridProject`}
            onClick={(e) =>
              handleProjectClick(e, `/projects/${project.slug?.current}`)
            }
            onMouseEnter={() => handleProjectHover(project)}
            onMouseLeave={() => handleProjectHover(null)}
          >
            <div className={styles.projectInfo}>
              <h3 className={styles.gridProjectTitle}>{project.title}</h3>
              <div className={styles.projectMeta}>
                {project.year && <span>{project.year}</span>}
                {project.client && <span>{project.client}</span>}
                <span>{TYPES_MAP[project.type as keyof typeof TYPES_MAP]}</span>
              </div>
            </div>
            <div className={styles.imageWrapper}>
              <Image
                src={project?.image?.asset?.url || ""}
                alt={project?.title || ""}
                layout="fill"
                placeholder="blur"
                blurDataURL={project?.image?.asset?.metadata?.lqip || ""}
                quality={90}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Hover image that follows the mouse */}
      {hoveredProject && (
        <div
          ref={hoverImageRef}
          className={styles.hoverImage}
          style={{
            position: "fixed",
            left: `${mousePosition.x + 10}px`,
            top: `${mousePosition.y + 10}px`,
            transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
            zIndex: 1000,
            width: "300px",
            height: "200px",
            pointerEvents: "none",
            opacity: 1,
            borderRadius: "4px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease-out",
          }}
        >
          <Image
            src={hoveredProject?.image?.asset?.url || ""}
            alt={hoveredProject?.title || ""}
            layout="fill"
            placeholder="blur"
            blurDataURL={hoveredProject?.image?.asset?.metadata?.lqip || ""}
            quality={90}
          />
        </div>
      )}
    </div>
  );
};

export default GridView;
