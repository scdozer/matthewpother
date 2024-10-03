import React, { useRef, useLayoutEffect, useCallback } from "react";
import Image from "next/image";
import { Projects } from "@/sanity/utils/graphql";
import { gsap } from "gsap";
import styles from "./styles.module.scss";

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

    tl.from(`.${styles.gridSectionTitle}`, {
      opacity: 0,
      y: 20,
      stagger: 0.2,
      duration: 0.5,
      ease: "power2.out",
    });

    tl.from(
      `.${styles.gridProject}`,
      {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.3"
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
      animateIn();
    } else {
      animateOut();
    }
  }, [isTransitioning, animateIn, animateOut]);

  const projectsByType = projects.reduce((acc, project) => {
    if (!acc[project.type]) acc[project.type] = [];
    acc[project.type].push(project);
    return acc;
  }, {});

  return (
    <div ref={gridRef} className={styles.gridElement}>
      {Object.entries(projectsByType).map(([type, typeProjects]) => (
        <div key={type} className={styles.gridSection}>
          <h2 className={styles.gridSectionTitle}>{type}</h2>
          <div className={styles.gridProjects}>
            {typeProjects.map((project) => (
              <div key={project.title} className={styles.gridProject}>
                <Image
                  src={project?.image?.asset?.url || ""}
                  alt={project?.title || ""}
                  width={200}
                  height={200}
                  objectFit="cover"
                />
                <p className={styles.gridProjectTitle}>{project.title}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridView;
