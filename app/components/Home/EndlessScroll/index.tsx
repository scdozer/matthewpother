import React, { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { Projects } from "@/sanity/utils/graphql";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectInfo from "../ProjectInfo";

import styles from "./styles.module.scss";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

interface EndlessScrollProps {
  projects: Projects[];
}

const EndlessScroll: React.FC<EndlessScrollProps> = ({ projects }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mainImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const bottomImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const mainImageContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const scrollElement = scrollRef.current;
    const mainImages = mainImagesRef.current;
    const bottomImages = bottomImagesRef.current;

    if (!container || !scrollElement) return;

    const totalProjects = projects.length;
    const projectHeight = window.innerHeight;
    scrollElement.style.height = `${projectHeight * (totalProjects + 1)}px`;

    const createIntroAnimation = () => {
      const introTl = gsap.timeline();

      introTl.set(window, {
        scrollTo: { y: 0, autoKill: false },
      });

      introTl.to(bottomImages.slice(0, 11), {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: "none",
        duration: 1,
      });

      introTl.set(
        bottomImages.slice(11),
        {
          opacity: 1,
          y: 0,
        },
        "<+=0.8"
      );

      const scrollPosition = projectHeight;
      introTl.add(() => {
        gsap.to(window, {
          duration: 0.5,
          scrollTo: { y: scrollPosition, autoKill: false },
          ease: "power2.inOut",
        });
      });

      return introTl;
    };

    const createMainAnimation = () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          snap: {
            snapTo: (value) =>
              Math.round(value * totalProjects) / totalProjects,
            duration: { min: 0.2, max: 0.3 },
            ease: "power1.inOut",
          },
        },
      });

      tl.to(
        mainImages,
        {
          yPercent: -100 * (totalProjects - 1),
          duration: totalProjects - 1,
          ease: "none",
        },
        0
      );

      tl.to(
        bottomImages,
        {
          xPercent: -100 * (totalProjects - 1),
          duration: totalProjects - 1,
          ease: "none",
        },
        0
      );

      bottomImages.forEach((image, index) => {
        tl.to(
          image,
          {
            yPercent: -100,
            duration: 1,
            ease: "none",
          },
          index
        );
      });

      projects.forEach((_, index) => {
        tl.fromTo(
          mainImages[index],
          { scale: 0.8, opacity: 0.3 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.75,
            ease: "none",
            yoyo: true,
          },
          index
        );
      });

      return tl;
    };

    const setupClickHandlers = () => {
      bottomImages.forEach((image, index) => {
        image?.addEventListener("click", () => {
          const scrollPosition = projectHeight * (index + 1);
          gsap.to(window, {
            duration: 0.5,
            scrollTo: { y: scrollPosition, autoKill: false },
            ease: "power2.inOut",
          });
        });
      });
    };

    const introTl = createIntroAnimation();
    const mainTl = createMainAnimation();
    setupClickHandlers();

    return () => {
      introTl.kill();
      mainTl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [projects]);

  return (
    <div ref={scrollRef} className={styles.scrollElement}>
      <div ref={containerRef} className={styles.container}>
        <div className={styles.mainImageContainer} ref={mainImageContainerRef}>
          <div className={styles.mainImage}> </div>
          {projects.map((project, index) => (
            <div
              key={project.title}
              ref={(el: HTMLDivElement | null) => {
                if (el) mainImagesRef.current[index] = el;
              }}
              className={styles.mainImage}
            >
              <Image
                src={project?.image?.asset?.url || ""}
                alt={project?.title || ""}
                layout="fill"
                objectFit="cover"
              />
            </div>
          ))}
        </div>

        <ProjectInfo projects={projects} scrollRef={scrollRef} />

        <div className={styles.bottomRowContainer}>
          {projects.map((project, index) => (
            <div
              key={project.title}
              ref={(el: HTMLDivElement | null) => {
                if (el) bottomImagesRef.current[index] = el;
              }}
              className={styles.bottomImage}
            >
              <Image
                src={project?.image?.asset?.url || ""}
                alt={project?.title || ""}
                layout="fill"
                objectFit="cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EndlessScroll;
