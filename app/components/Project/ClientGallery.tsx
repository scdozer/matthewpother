import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { SanityImageAsset, SanityFileAsset } from "@/sanity/utils/graphql";
import ReactPlayer from "react-player/lazy";
import styles from "./style.module.scss";

gsap.registerPlugin(ScrollTrigger);

interface ProjectGalleryProps {
  gallery: any;
  videoEmbed?: string;
}

const ProjectGallery = ({ gallery, videoEmbed }: ProjectGalleryProps) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  useEffect(() => {
    if (galleryRef.current) {
      const items = gsap.utils.toArray(
        galleryRef.current.querySelectorAll(`.${styles.galleryItem}`)
      );

      // Better mobile detection that works with Safari
      const isMobile =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;

      // Handle window resize
      const handleResize = () => {
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize);

      // Handle orientation change
      window.addEventListener("orientationchange", () => {
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 200);
      });

      if (isIOS) {
        // iOS-specific approach using IntersectionObserver
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const item = entry.target as HTMLElement;
                const index = items.indexOf(item);
                const isEven = index % 2 === 0;
                const startPosition = isEven ? "20%" : "-20%";

                gsap.fromTo(
                  item,
                  {
                    y: startPosition,
                    opacity: 0,
                    scale: 0.8,
                  },
                  {
                    y: "0%",
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: "power2.out",
                  }
                );

                // Once animated, unobserve
                observer.unobserve(item);
              }
            });
          },
          {
            root: null,
            rootMargin: "0px",
            threshold: 0.1,
          }
        );

        // Observe all items
        items.forEach((item) => {
          observer.observe(item as HTMLElement);
        });

        return () => {
          observer.disconnect();
          window.removeEventListener("resize", handleResize);
          window.removeEventListener("orientationchange", handleResize);
        };
      } else {
        // Non-iOS approach using ScrollTrigger timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: galleryRef.current,
            start: "top 60%",
            end: "bottom bottom",
            scrub: isMobile ? 0.5 : 1,
            // markers: true, // Uncomment for debugging
          },
        });

        // Add each item to the timeline with staggered timing
        items.forEach((item: any, index: number) => {
          const isEven = index % 2 === 0;
          const startPosition = isEven ? "20%" : "-20%";

          // Set initial state
          gsap.set(item, {
            y: startPosition,
            opacity: 0,
            scale: 0.8,
          });

          // Add to timeline with staggered timing
          tl.to(
            item,
            {
              y: "0%",
              opacity: 1,
              scale: 1,
              duration: 0.5,
              ease: "power2.out",
            },
            index * 0.1
          ); // Stagger the animations
        });

        // Force a refresh after a short delay to ensure everything is set up correctly
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 500);

        // Clean up event listeners
        return () => {
          window.removeEventListener("resize", handleResize);
          window.removeEventListener("orientationchange", handleResize);
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
      }
    }
  }, [gallery, videoEmbed, isIOS]);

  const isImageAsset = (item: any): item is { asset: SanityImageAsset } => {
    return item.asset && item.asset._type === "sanity.imageAsset";
  };

  const isFileAsset = (item: any): item is { asset: SanityFileAsset } => {
    return item.asset && item.asset._type === "sanity.fileAsset";
  };

  return (
    <div ref={galleryRef} className={styles.galleryContainer}>
      {videoEmbed && (
        <div className={`${styles.galleryItem} ${styles.videoItem}`}>
          <ReactPlayer
            url={videoEmbed}
            width="100%"
            height="100%"
            playing={false}
            loop={false}
            muted={false}
            playsinline={true}
            controls={true}
            style={{ position: "absolute", top: 0, left: 0 }}
            config={{
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  controls: 1,
                  autoplay: 0,
                  showinfo: 0,
                  rel: 0,
                },
              },
              vimeo: {
                playerOptions: {
                  background: false,
                  autoplay: false,
                  controls: true,
                  responsive: true,
                  dnt: true,
                },
              },
            }}
          />
        </div>
      )}
      {gallery?.map(
        (item: SanityImageAsset | SanityFileAsset, index: number) => (
          <div
            key={index}
            className={`${styles.galleryItem} ${
              index % 3 === 0
                ? styles.large
                : index % 3 === 1
                  ? styles.medium
                  : styles.small
            }`}
          >
            {isImageAsset(item) && (
              <Image
                src={item?.asset?.url || ""}
                alt={`Project image ${index + 1}`}
                width={item?.asset?.metadata?.dimensions?.width || 1000}
                height={item?.asset?.metadata?.dimensions?.height || 1000}
                layout="responsive"
                placeholder="blur"
                blurDataURL={item?.asset?.metadata?.lqip || ""}
                quality={90}
                style={{ objectFit: "cover" }}
              />
            )}
            {isFileAsset(item) && (
              <a
                href={item?.asset?.url || ""}
                download
                className={styles.fileDownload}
              >
                {item.asset.originalFilename}
              </a>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default ProjectGallery;
