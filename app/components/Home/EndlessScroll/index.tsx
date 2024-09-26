import React, { useRef, useLayoutEffect, useState, useCallback } from "react";
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
  const gridRef = useRef<HTMLDivElement>(null);
  const mainImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const bottomImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const mainImageContainerRef = useRef<HTMLDivElement>(null);
  const [isGridView, setIsGridView] = useState(false);

  // Refs to store animation functions
  const createIntroAnimationRef = useRef<() => gsap.core.Timeline>(() =>
    gsap.timeline()
  );
  const createMainAnimationRef = useRef<() => gsap.core.Timeline>(() =>
    gsap.timeline()
  );
  const transitionToGridViewRef = useRef<() => gsap.core.Timeline>(() =>
    gsap.timeline()
  );
  const animateGridViewRef = useRef<() => gsap.core.Timeline>(() =>
    gsap.timeline()
  );
  const transitionToScrollViewRef = useRef<() => gsap.core.Timeline>(() =>
    gsap.timeline()
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    const scrollElement = scrollRef.current;
    const gridElement = gridRef.current;
    const mainImages = mainImagesRef.current;
    const bottomImages = bottomImagesRef.current;

    if (!container || !scrollElement || !gridElement) return;

    const totalProjects = projects.length;
    const projectHeight = window.innerHeight;
    scrollElement.style.height = `${projectHeight * (totalProjects + 1)}px`;

    createIntroAnimationRef.current = () => {
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

    createMainAnimationRef.current = () => {
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

    transitionToGridViewRef.current = () => {
      const tl = gsap.timeline();

      tl.to(window, {
        duration: 0.5,
        scrollTo: { y: 0, autoKill: false },
        ease: "power2.inOut",
      });

      tl.to(bottomImages, {
        opacity: 0,
        y: 50,
        stagger: 0.03,
        ease: "power2.in",
        duration: 0.8,
      });

      tl.set(scrollElement, { display: "none" });
      tl.set(gridElement, { display: "block", opacity: 0 });
      tl.to(gridElement, { opacity: 1, duration: 0.5 });

      return tl;
    };

    animateGridViewRef.current = () => {
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
    };

    transitionToScrollViewRef.current = () => {
      const tl = gsap.timeline();

      tl.to(`.${styles.gridSectionTitle}, .${styles.gridProject}`, {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.in",
      });

      tl.to(gridElement, { opacity: 0, duration: 0.5 });
      tl.set(gridElement, { display: "none" });
      tl.set(scrollElement, { display: "block", opacity: 0 });
      tl.to(scrollElement, { opacity: 1, duration: 0.5 });

      tl.add(createIntroAnimationRef.current());

      return tl;
    };

    // Initial setup
    if (!isGridView) {
      const scrollTl = createIntroAnimationRef.current();
      scrollTl.add(createMainAnimationRef.current());
      setupClickHandlers();
    } else {
      const gridTl = gsap.timeline();
      gridTl.add(animateGridViewRef.current());
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isGridView, projects]);

  const toggleView = useCallback(() => {
    if (isGridView) {
      const scrollTl = gsap.timeline();
      scrollTl.add(transitionToScrollViewRef.current());
      scrollTl.add(createMainAnimationRef.current());
    } else {
      const gridTl = gsap.timeline();
      gridTl.add(transitionToGridViewRef.current());
      gridTl.add(animateGridViewRef.current());
    }
    setIsGridView(!isGridView);
  }, [isGridView]);

  const projectsByType = projects.reduce((acc, project) => {
    if (!acc[project.type]) acc[project.type] = [];
    acc[project.type].push(project);
    return acc;
  }, {});

  return (
    <>
      <button onClick={toggleView} className={styles.viewToggleButton}>
        {isGridView ? "Switch to Scroll View" : "Switch to Grid View"}
      </button>
      <div
        ref={scrollRef}
        className={styles.scrollElement}
        style={{ display: isGridView ? "none" : "block" }}
      >
        <div ref={containerRef} className={styles.container}>
          <div
            className={styles.mainImageContainer}
            ref={mainImageContainerRef}
          >
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
      <div
        ref={gridRef}
        className={styles.gridElement}
        style={{ display: isGridView ? "block" : "none" }}
      >
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
    </>
  );
};

export default EndlessScroll;
