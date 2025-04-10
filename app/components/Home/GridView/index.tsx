import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Projects } from "@/sanity/utils/graphql";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./styles.module.scss";

gsap.registerPlugin(ScrollTrigger);

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

    // Animate in
    const projects = gsap.utils.toArray<HTMLElement>(".gridProject");

    gsap.set(projects, { opacity: 0, y: 20 });

    ScrollTrigger.batch(projects, {
      start: "top 80%",
      onEnter: (batch) => {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });
      },
      onLeave: (batch) => {
        gsap.to(batch, { opacity: 0, y: 20, duration: 0.5 });
      },
      onEnterBack: (batch) => {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });
      },
      onLeaveBack: (batch) => {
        gsap.to(batch, { opacity: 0, y: 20, duration: 0.5 });
      },
    });

    // Animate elements that are initially in view
    gsap.utils.toArray<HTMLElement>(".gridProject").forEach((project) => {
      if (ScrollTrigger.isInViewport(project)) {
        gsap.to(project, { opacity: 1, y: 0, duration: 0.5 });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
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
      <div className={styles.gridProjects}>
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
                objectFit="cover"
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
            objectFit="cover"
          />
        </div>
      )}
    </div>
  );
};

export default GridView;
