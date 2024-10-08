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

  useEffect(() => {
    if (isTransitioning) {
      // Handle transition out
      gsap.to(gridRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        onComplete: () => onTransitionComplete("scroll"),
      });
      return;
    }

    // Animate in
    const sections = gsap.utils.toArray<HTMLElement>(".gridSection");
    sections.forEach((section) => {
      const title = section.querySelector(".gridSectionTitle");
      const projects = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".gridProject")
      );

      gsap.set([title, ...projects], { opacity: 0, y: 20 });

      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        onEnter: () => {
          gsap.to(title, { opacity: 1, y: 0, duration: 0.5 });
          gsap.to(projects, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });
        },
        onEnterBack: () => {
          gsap.to(title, { opacity: 1, y: 0, duration: 0.5 });
          gsap.to(projects, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });
        },
        onLeave: () => {
          gsap.to([title, ...projects], { opacity: 0, y: 20, duration: 0.5 });
        },
        onLeaveBack: () => {
          gsap.to([title, ...projects], { opacity: 0, y: 20, duration: 0.5 });
        },
      });
    });

    // Animate elements that are initially in view
    gsap.utils.toArray<HTMLElement>(".gridSection").forEach((section) => {
      if (ScrollTrigger.isInViewport(section)) {
        const title = section.querySelector(".gridSectionTitle");
        const projects = gsap.utils.toArray<HTMLElement>(
          section.querySelectorAll(".gridProject")
        );
        gsap.to(title, { opacity: 1, y: 0, duration: 0.5 });
        gsap.to(projects, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isTransitioning, onTransitionComplete]);

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
      {Object.entries(projectsByType).map(
        ([type, typeProjects], sectionIndex) => (
          <div key={type} className={`${styles.gridSection} gridSection`}>
            <h2 className={`${styles.gridSectionTitle} gridSectionTitle`}>
              {TYPES_MAP[type as keyof typeof TYPES_MAP]}
            </h2>
            <div className={styles.gridProjects}>
              {typeProjects.map((project) => (
                <Link
                  href={`/projects/${project.slug?.current}`}
                  key={project.title}
                  className={`${styles.gridProject} gridProject`}
                  onClick={(e) =>
                    handleProjectClick(e, `/projects/${project.slug?.current}`)
                  }
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
        )
      )}
    </div>
  );
};

export default GridView;
