"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { PortableText } from "@portabletext/react";
import { Projects } from "@/sanity/utils/graphql";
import styles from "./style.module.scss";
import ProjectGallery from "./ClientGallery";
import GridView from "@/app/components/GridView";

gsap.registerPlugin(ScrollTrigger);

export default function Project({
  project,
  projects,
}: {
  project: Projects;
  projects: Projects[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const [currentView, setCurrentView] = useState<"3d" | "grid">("3d");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleViewChange = () => {
    setIsTransitioning(true);
  };

  const handleTransitionComplete = (view: "3d" | "grid") => {
    setCurrentView(view);
    setIsTransitioning(false);
  };

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      titleRef.current,
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );

    tl.fromTo(
      descriptionRef.current,
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.3"
    );

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (isTransitioning && !isNavigating) {
      if (currentView === "3d") {
        handleTransitionComplete("grid");
      } else {
        setTimeout(() => {
          handleTransitionComplete("3d");
        }, 1000);
      }
    }
  }, [isTransitioning, currentView, isNavigating]);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.content}>
        <h2 ref={titleRef} className={styles.title}>
          {project.title} / {project.type}
        </h2>
        <div ref={descriptionRef} className={styles.description}>
          <PortableText value={project.descriptionRaw} />
        </div>
      </div>

      <ProjectGallery
        gallery={project.gallery}
        videoEmbed={project?.videoEmbed || ""}
      />

      {currentView === "grid" && !isNavigating && (
        <GridView
          projects={projects}
          isTransitioning={isTransitioning}
          onTransitionComplete={() => handleTransitionComplete("3d")}
        />
      )}
      {!isNavigating && (
        <button className={styles.viewToggle} onClick={handleViewChange}>
          {currentView === "3d" ? "all projects" : "back"}
        </button>
      )}
    </div>
  );
}
