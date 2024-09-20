"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ReactPlayer from "react-player";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { Projects } from "@/sanity/utils/graphql";
import styles from "./style.module.scss";

gsap.registerPlugin(ScrollTrigger);

export default function Project({ project }: { project: Projects }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const textElements =
        containerRef.current.querySelectorAll(".animate-text");
      gsap.fromTo(
        textElements,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    }

    if (imagesRef.current) {
      const images = gsap.utils.toArray(imagesRef.current.children);

      images.forEach((image: any, index: number) => {
        // Set random width between 50% and 90%
        const randomWidth = gsap.utils.random(50, 90);
        const randomSpeed = gsap.utils.random(0.5, 2); // Random speed multiplier
        const randomStart = gsap.utils.random(-50, 50); // Random starting position

        gsap.set(image, {
          width: `${randomWidth}%`,
          clipPath: "inset(100% 0% 0% 0%)",
          xPercent: () => gsap.utils.random(-10, 10), // Random horizontal offset
          yPercent: randomStart,
        });

        ScrollTrigger.create({
          trigger: image,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => {
            gsap.to(image, {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.5,
              ease: "power4.out",
            });
          },
          onLeaveBack: () => {
            gsap.to(image, {
              clipPath: "inset(100% 0% 0% 0%)",
              duration: 0.2,
              ease: "power4.in",
            });
          },
        });

        gsap.to(image, {
          yPercent: randomStart - 100 * randomSpeed, // Move relative to start position
          ease: "none",
          scrollTrigger: {
            trigger: imagesRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.content}>
        <h2 className="animate-text">
          {project.title} / {project.type}
        </h2>
        <div className="animate-text">
          <PortableText value={project.descriptionRaw} />
        </div>
      </div>

      <div ref={imagesRef} className={styles.imageGrid}>
        {project.gallery?.map((image, index) => (
          <div key={index} className={styles.imageContainer}>
            <Image
              src={image?.asset?.url || ""}
              alt={`Project image ${index}`}
              width={image?.asset?.metadata?.dimensions?.width || 1000}
              height={image?.asset?.metadata?.dimensions?.height || 1000}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        ))}
      </div>

      {project.videoEmbed && (
        <div>
          <ReactPlayer url={project.videoEmbed} />
        </div>
      )}
    </div>
  );
}
