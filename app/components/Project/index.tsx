"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { PortableText } from "@portabletext/react";
import { Projects } from "@/sanity/utils/graphql";
import styles from "./style.module.scss";
import ProjectGallery from "./ClientGallery";

gsap.registerPlugin(ScrollTrigger);

export default function Project({ project }: { project: Projects }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

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
    </div>
  );
}
