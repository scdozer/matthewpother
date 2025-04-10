import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (galleryRef.current) {
      const items = gsap.utils.toArray(
        galleryRef.current.querySelectorAll(`.${styles.galleryItem}`)
      );

      items.forEach((item: any, index: number) => {
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
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top bottom-=100",
              end: "top 70%",
              scrub: 1,
            },
          }
        );
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [gallery, videoEmbed]);

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
