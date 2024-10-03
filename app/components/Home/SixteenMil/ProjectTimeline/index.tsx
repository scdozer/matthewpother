import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { gsap } from "gsap";
import { Projects } from "@/sanity/utils/graphql";
import styles from "./styles.module.scss";

interface ProjectTimelineProps {
  projects: Projects[];
  currentIndex: number;
  onProjectChange: (index: number) => void;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  projects,
  currentIndex,
  onProjectChange,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const redLineRef = useRef<HTMLDivElement>(null);
  const projectInfoRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const projectItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (redLineRef.current && timelineRef.current && projectInfoRef.current) {
      const duration = 5;

      const initialTl = gsap.timeline();

      initialTl.to(projectItemsRef.current, {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 0.5,
        ease: "power2.out",
      });

      initialTl.to(
        redLineRef.current,
        { height: "100%", duration: 0.5, ease: "power2.inOut" },
        "-=0.3"
      );

      initialTl.to(projectInfoRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      tlRef.current = gsap
        .timeline({ repeat: -1, delay: 1 })
        .to(redLineRef.current, {
          left: "100%",
          duration: duration * projects.length,
          ease: "linear",
          onUpdate: () => {
            const progress = tlRef.current?.progress() || 0;
            const newIndex = Math.floor(progress * projects.length);
            if (newIndex !== currentIndex) {
              onProjectChange(newIndex);
            }
          },
          onComplete: () => {
            onProjectChange(0);
          },
        });
    }

    return () => {
      tlRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (projectInfoRef.current) {
      gsap.fromTo(
        projectInfoRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.inOut",
        }
      );
    }
  }, [currentIndex]);

  return (
    <div className={styles.HTMLwrap}>
      <div className={styles.projectTimeline}>
        <div className={styles.projectInfo} ref={projectInfoRef}>
          <h2>{projects[currentIndex].title}</h2>
          <p>{projects[currentIndex].type}</p>
          <Link
            href={`/projects/${projects[currentIndex].slug?.current}`}
            className={styles.button}
          >
            View Project
          </Link>
        </div>
        <div className={styles.timelineSection} ref={timelineRef}>
          {projects.map((project, index) => (
            <div
              key={project.title}
              className={`${styles.timelineItem} ${index === currentIndex ? styles.active : ""}`}
              onClick={() => {
                onProjectChange(index);
                tlRef.current?.progress(index / projects.length);
              }}
              ref={(el) => (projectItemsRef.current[index] = el)}
            >
              <Image
                src={project?.image?.asset?.url || ""}
                alt={project?.title || ""}
                width={200}
                height={200}
                objectFit="cover"
              />
            </div>
          ))}
          <div className={styles.redLine} ref={redLineRef} />
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
