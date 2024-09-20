import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Projects } from "@/sanity/utils/graphql";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectInfo from "../ProjectInfo";

import styles from "./styles.module.scss";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);

interface EndlessScrollProps {
  projects: Projects[];
}

const EndlessScroll: React.FC<EndlessScrollProps> = ({ projects }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mainImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const bottomImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const mainImageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const scrollElement = scrollRef.current;
    const mainImages = mainImagesRef.current;
    const bottomImages = bottomImagesRef.current;

    if (!container || !scrollElement) return;

    const introTl = gsap.timeline();

    introTl.add(() => {
      if (typeof window !== "undefined") {
        gsap.to(window, {
          duration: 0.5,
          scrollTo: {
            y: 0,
            autoKill: false,
          },
          ease: "power2.inOut",
          // onComplete: () => {
          //   ScrollTrigger.refresh();
          // },
        });
      }
    });

    introTl.to(bottomImages.slice(0, 10), {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      ease: "power2.out",
      duration: 0.8,
    });

    introTl.set(
      bottomImages.slice(10),
      {
        opacity: 1,
        y: 0,
      },
      "<"
    );
    introTl.add(() => {
      if (typeof window !== "undefined") {
        const scrollDistance =
          (mainImageContainerRef.current?.offsetHeight || 0) *
          (1.3 / projects.length);
        gsap.to(window, {
          duration: 0.5,
          scrollTo: {
            y: scrollDistance,
            autoKill: false,
          },
          ease: "power2.inOut",
          // onComplete: () => {
          //   ScrollTrigger.refresh();
          // },
        });
      }
    });

    let st: ScrollTrigger;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 2.5,
        pinSpacing: false,
        snap: {
          snapTo: 1 / projects.length,
          duration: { min: 0.2, max: 0.5 },
          ease: "power2.out",
        },
        // onRefreshInit: (self: ScrollTrigger) => {
        //   st = self;
        // },
      },
    });

    tl.to(
      mainImages,
      {
        yPercent: -100 * projects.length,
        duration: projects.length,
        ease: "none",
      },
      0
    );

    tl.to(
      bottomImages,
      {
        xPercent: -100 * (projects.length - 1),
        duration: projects.length - 1,
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

    return () => {
      introTl.kill();
      tl.kill();
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
