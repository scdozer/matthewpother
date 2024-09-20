import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Projects } from "@/sanity/utils/graphql";
import styles from "./styles.module.scss";
import { PortableText } from "@portabletext/react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

interface ProjectInfoProps {
  projects: Projects[];
  scrollRef: React.RefObject<HTMLDivElement>;
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({ projects, scrollRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const infoRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current || !scrollRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 2.5,
        pinSpacing: false,
        snap: {
          snapTo: 1 / projects.length,
          duration: { min: 0.2, max: 0.5 },
          ease: "power2.out",
        },
      },
    });

    tl.to(
      infoRefs.current,
      {
        yPercent: -100 * projects.length + 1,
        duration: projects.length + 1,
        ease: "none",
      },
      0
    );

    return () => {
      tl.kill();
    };
  }, [projects, scrollRef]);

  return (
    <div ref={containerRef} className={styles.infoContainer}>
      <div className={styles.projectInfo}></div>
      {projects.map((project, index) => (
        <div
          key={project.title}
          ref={(el: HTMLDivElement | null) => {
            if (el) infoRefs.current[index] = el;
          }}
          className={styles.projectInfo}
        >
          <h2 className={styles.title}>{project.title}</h2>
          <p className={styles.type}>{project.type}</p>
          <Link
            href={`/projects/${project?.slug?.current}`}
            className={styles.button}
          >
            View Project
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ProjectInfo;
