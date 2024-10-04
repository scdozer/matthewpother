import React, { useRef, useLayoutEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Projects } from "@/sanity/utils/graphql";
import { gsap } from "gsap";
import styles from "./styles.module.scss";

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

  const animateIn = useCallback(() => {
    const tl = gsap.timeline();
    gsap.set(`.${styles.gridSectionTitle}, .${styles.gridProject}`, {
      opacity: 0,
      y: 20,
    });

    tl.fromTo(
      `.${styles.gridSectionTitle}`,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 0.5,
        ease: "power2.out",
      }
    );

    tl.fromTo(
      `.${styles.gridProject}`,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.75"
    );

    return tl;
  }, []);

  const animateOut = useCallback(() => {
    const tl = gsap.timeline();

    tl.to(`.${styles.gridSectionTitle}, .${styles.gridProject}`, {
      opacity: 0,
      y: 20,
      stagger: 0.05,
      duration: 0.5,
      ease: "power2.in",
    });

    tl.to(gridRef.current, { opacity: 0, duration: 0.5 });

    tl.add(() => onTransitionComplete("scroll"));

    return tl;
  }, [onTransitionComplete]);

  useLayoutEffect(() => {
    if (!isTransitioning) {
      gsap.set(gridRef.current, { opacity: 1 });
      gsap.set(`.${styles.gridSectionTitle}, .${styles.gridProject}`, {
        opacity: 0,
        y: 20,
      });
      animateIn();
    } else {
      animateOut();
    }
  }, [isTransitioning, animateIn, animateOut]);

  const projectsByType = projects.reduce<Record<string, Projects[]>>(
    (acc, project) => {
      const type = project.type || "Uncategorized";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(project);
      return acc;
    },
    {}
  );

  return (
    <div ref={gridRef} className={styles.gridElement}>
      {Object.entries(projectsByType).map(([type, typeProjects]) => (
        <div key={type} className={styles.gridSection}>
          <h2 className={styles.gridSectionTitle}>
            {TYPES_MAP[type as keyof typeof TYPES_MAP]}
          </h2>
          <div className={styles.gridProjects}>
            {typeProjects.map((project) => (
              <Link
                href={`/projects/${project.slug?.current}`}
                key={project.title}
                className={styles.gridProject}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={project?.image?.asset?.url || ""}
                    alt={project?.title || ""}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <p className={styles.gridProjectTitle}>{project.title}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridView;
