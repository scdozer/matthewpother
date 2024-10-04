import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { SanityImageAsset, SanityFileAsset } from "@/sanity/utils/graphql";
import styles from "./style.module.scss";

gsap.registerPlugin(ScrollTrigger);

interface ClientSideGalleryProps {
  gallery: any[];
}

const ClientSideGallery = ({ gallery }: ClientSideGalleryProps) => {
  const imagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  return (
    <div ref={imagesRef} className={styles.imageGrid}>
      {gallery?.map((item, index) => (
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
  );
};

export default ClientSideGallery;
