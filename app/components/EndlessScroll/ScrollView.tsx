import React, { useRef, useLayoutEffect, useCallback } from "react";
import Image from "next/image";
import { Projects } from "@/sanity/utils/graphql";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectInfo from "./ProjectInfo";
import styles from "./styles.module.scss";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

interface ScrollViewProps {
  projects: Projects[];
  isTransitioning: boolean;
  onTransitionComplete: (view: "grid" | "scroll") => void;
}

const ScrollView: React.FC<ScrollViewProps> = ({
  projects,
  isTransitioning,
  onTransitionComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mainImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const bottomImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const mainImageContainerRef = useRef<HTMLDivElement>(null);
  const mainImageHeightRef = useRef<number>(0);

  const createIntroAnimation = useCallback(() => {
    const introTl = gsap.timeline();
    const bottomImages = bottomImagesRef.current;

    introTl.set(window, { scrollTo: { y: 0, autoKill: false } });

    introTl.to(bottomImages.slice(0, 11), {
      opacity: 1,
      y: 0,
      stagger: 0.03,
      ease: "none",
      duration: 0.8,
    });

    introTl.set(
      bottomImages.slice(11),
      {
        opacity: 1,
        y: 0,
      },
      "<+=0.8"
    );

    const scrollPosition = window.innerHeight;
    introTl.add(() => {
      gsap.to(window, {
        duration: 0.5,
        scrollTo: { y: scrollPosition, autoKill: false },
        ease: "power2.inOut",
      });
    });

    return introTl;
  }, []);

  const createMainAnimation = useCallback(() => {
    const scrollElement = scrollRef.current;
    const mainImages = mainImagesRef.current;
    const bottomImages = bottomImagesRef.current;

    if (!scrollElement) return gsap.timeline();

    const totalProjects = projects.length;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        snap: {
          snapTo: (value) => Math.round(value * totalProjects) / totalProjects,
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
  }, [projects]);

  const setupClickHandlers = useCallback(() => {
    const bottomImages = bottomImagesRef.current;
    const projectHeight = window.innerHeight;

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
  }, []);

  const animateOut = useCallback(() => {
    const tl = gsap.timeline();
    const bottomImages = bottomImagesRef.current;

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

    tl.to(scrollRef.current, { opacity: 0, duration: 0.5 });

    tl.add(() => onTransitionComplete("grid"));

    return tl;
  }, [onTransitionComplete]);

  useLayoutEffect(() => {
    if (!isTransitioning) {
      const scrollTl = createIntroAnimation();
      scrollTl.add(createMainAnimation());
      setupClickHandlers();
    } else {
      animateOut();
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [
    isTransitioning,
    createIntroAnimation,
    createMainAnimation,
    setupClickHandlers,
    animateOut,
  ]);

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

export default ScrollView;
