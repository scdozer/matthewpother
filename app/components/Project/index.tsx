"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ReactPlayer from "react-player";
import { PortableText } from "@portabletext/react";
import { Projects } from "@/sanity/utils/graphql";
import styles from "./style.module.scss";
import { SanityImageAsset, SanityFileAsset } from "@/sanity/utils/graphql";

gsap.registerPlugin(ScrollTrigger);

export default function Project({ project }: { project: Projects }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

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

      images.forEach((image: any) => {
        gsap.set(image, {
          clipPath: "inset(100% 0% 0% 0%)",
        });

        ScrollTrigger.create({
          trigger: image,
          start: "top bottom",
          end: "top 50%",
          onEnter: () => {
            gsap.to(image, {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.5,
              ease: "power2.out",
            });
          },
          onLeaveBack: () => {
            gsap.to(image, {
              clipPath: "inset(100% 0% 0% 0%)",
              duration: 0.3,
              ease: "power2.in",
            });
          },
        });
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const isImageAsset = (item: any): item is { asset: SanityImageAsset } => {
    return item.asset && item.asset._type === "sanity.imageAsset";
  };

  const isFileAsset = (item: any): item is { asset: SanityFileAsset } => {
    return item.asset && item.asset._type === "sanity.fileAsset";
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

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
        {project.gallery?.map((item, index) => (
          <div key={index}>
            {isImageAsset(item) && (
              <Image
                src={item?.asset?.url || ""}
                alt={`Project image`}
                width={item?.asset?.metadata?.dimensions?.width || 1000}
                height={item?.asset?.metadata?.dimensions?.height || 1000}
                style={{ width: "100%", height: "auto" }}
              />
            )}
            {isFileAsset(item) && (
              <a href={item?.asset?.url || ""} download>
                {item.asset.originalFilename}
              </a>
            )}
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
