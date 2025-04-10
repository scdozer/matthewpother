import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { gsap } from "gsap";
import { Projects } from "@/sanity/utils/graphql";
import styles from "./styles.module.scss";

const TYPES_MAP = {
  Docs: "Documentaries",
  narrative: "Narratives",
  musicVideo: "Music Videos",
  commercial: "Commercial",
  stills: "Stills",
};

interface ProjectTimelineProps {
  projects: Projects[];
  currentIndex: number;
  onProjectChange: (index: number) => void;
  onProjectNavigation: (slug: string) => void;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  projects,
  currentIndex,
  onProjectChange,
  onProjectNavigation,
}) => {
  const [animatingIndex, setAnimatingIndex] = useState(currentIndex);
  const timelineRef = useRef<HTMLDivElement>(null);
  const redLineRef = useRef<HTMLDivElement>(null);
  const projectInfoRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const projectItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const setProjectItemRef = (el: HTMLDivElement | null, index: number) => {
    projectItemsRef.current[index] = el;
  };

  useEffect(() => {
    if (redLineRef.current && timelineRef.current && projectInfoRef.current) {
      const duration = 4;

      const initialTl = gsap.timeline();

      initialTl.to(projectItemsRef.current, {
        opacity: 1,
        y: 0,
        stagger: 0.01,
        duration: 0.5,
        ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      });

      initialTl.to(
        redLineRef.current,
        {
          height: "2px",
          duration: 0.5,
          ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        },
        "-=0.3"
      );

      initialTl.to(projectInfoRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        delay: 5,
      });

      // Create the main timeline
      tlRef.current = gsap.timeline({ repeat: -1, delay: 0 });

      // Add animations for each project
      projects.forEach((_, index) => {
        const projectWidth = 100 / projects.length;
        const startPosition = index * projectWidth;

        tlRef.current
          ?.to(redLineRef.current, {
            left: `${startPosition}%`,
            width: `${projectWidth}%`,
            duration: duration / 2, // Half the duration for growing
            ease: "power2.inOut",
          })
          .to(redLineRef.current, {
            width: "0%",
            left: `${startPosition + projectWidth}%`,
            duration: duration / 2, // Half the duration for shrinking
            ease: "power2.inOut",
            onUpdate: () => {
              const progress = tlRef.current?.progress() || 0;
              const newIndex = Math.floor(progress * projects.length);
              setAnimatingIndex(newIndex);
            },
            onComplete:
              index === projects.length - 1
                ? () => {
                    setAnimatingIndex(0);
                  }
                : undefined,
          });
      });
    }

    return () => {
      tlRef.current?.kill();
    };
  }, [projects]);

  useEffect(() => {
    if (projectInfoRef.current) {
      gsap.fromTo(
        projectInfoRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.25,
          ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
          delay: 0.2,
          stagger: 0.1,
        }
      );
    }
  }, [currentIndex]);

  useEffect(() => {
    if (animatingIndex !== currentIndex) {
      onProjectChange(animatingIndex);
    }
  }, [animatingIndex, currentIndex, onProjectChange]);

  return (
    <div className={styles.HTMLwrap}>
      <div className={styles.projectTimeline}>
        <div className={styles.projectInfo} ref={projectInfoRef}>
          <p>
            {TYPES_MAP[projects[animatingIndex].type as keyof typeof TYPES_MAP]}
          </p>
          <h2>{projects[animatingIndex].title}</h2>
          <button
            className={styles.button}
            onClick={() =>
              onProjectNavigation(projects[animatingIndex].slug?.current || "")
            }
          >
            View Project
          </button>
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
              ref={(el) => setProjectItemRef(el, index)}
            >
              <Image
                src={project?.image?.asset?.url || ""}
                alt={project?.title || ""}
                fill={true}
                placeholder="blur"
                blurDataURL={project?.image?.asset?.metadata?.lqip || ""}
                quality={90}
                style={{ objectFit: "cover" }}
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
