import React, { forwardRef, useRef, useEffect } from "react";
import { gsap } from "gsap";
import styles from "./styles.module.scss";
import { PortableText } from "@portabletext/react";
import { Layout as SanityLayout } from "../../../../sanity/utils/graphql";
import Image from "next/image";

interface AboutProps {
  layout: SanityLayout;
  onClose: () => void;
  showAbout: boolean;
}

const About = forwardRef<HTMLDivElement, AboutProps>(
  ({ layout, onClose, showAbout }, ref) => {
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    const imageRef = useRef<HTMLDivElement>(null);
    const textRefs = useRef<HTMLDivElement[]>([]);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      if (!showAbout) return;
      tlRef.current = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out", delay: 0.25 },
        onReverseComplete: onClose,
      });

      textRefs.current.forEach((el, index) => {
        tlRef.current!.fromTo(
          el.querySelector(`.${styles.textWrapper}`),
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: 0.3,
            ease: "power4.out",
            delay: 0.25,
          },
          0.2 + index * 0.1
        );
      });

      tlRef.current.fromTo(
        imageRef.current,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.out" },
        0.5
      );

      tlRef.current.fromTo(
        closeRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" },
        0
      );

      tlRef.current.play();

      //   return () => {
      //     tlRef.current?.kill();
      //   };
    }, [showAbout]);

    const addToTextRefs = (el: HTMLDivElement | null) => {
      if (el && !textRefs.current.includes(el)) {
        textRefs.current.push(el);
      }
    };

    const InstagramIcon = () => {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    };

    return (
      <div ref={ref} className={styles.about}>
        <button
          ref={closeRef}
          className={styles.closeButton}
          onClick={() => {
            tlRef.current?.reverse();
          }}
        >
          Close
        </button>

        {/* Content on the left */}
        <div className={styles.content}>
          {/* Title */}
          <div className={styles.textSection} ref={addToTextRefs}>
            <div className={styles.textWrapper}>
              <h2>{layout.title}</h2>
            </div>
          </div>

          {/* Contact Details */}
          <div className={styles.textSection} ref={addToTextRefs}>
            <div className={styles.textWrapper}>
              <div className={styles.contactDetails}>
                {/* Instagram */}
                {layout.instagram && (
                  <div className={styles.contactItem}>
                    <a
                      href={layout.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InstagramIcon />
                    </a>
                  </div>
                )}

                {/* Phone */}
                {layout.phone && (
                  <div className={styles.contactItem}>
                    <a href={`tel:${layout.phone}`}>{layout.phone}</a>
                  </div>
                )}

                {/* Email */}
                {layout.email && (
                  <div className={styles.contactItem}>
                    <a href={`mailto:${layout.email}`}>{layout.email}</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={styles.textSection} ref={addToTextRefs}>
            <div className={styles.textWrapper}>
              <PortableText value={layout.descriptionRaw} />
            </div>
          </div>

          {/* Extra Info */}
          <div className={styles.textSection} ref={addToTextRefs}>
            <div className={styles.textWrapper}>
              <PortableText value={layout.extraInfoRaw} />
            </div>
          </div>

          {/* Accolades */}
          <div className={styles.textSection} ref={addToTextRefs}>
            <div className={styles.textWrapper}>
              <PortableText value={layout.accoladesRaw} />
            </div>
          </div>
        </div>

        {/* Image on the right */}
        {layout.image?.asset?.url && (
          <div className={styles.imageContainer} ref={imageRef}>
            <Image
              src={layout.image.asset.url}
              alt={layout.title || "Image"}
              height={layout.image.asset.metadata?.dimensions?.height ?? 0}
              width={layout.image.asset.metadata?.dimensions?.width ?? 0}
            />
          </div>
        )}
      </div>
    );
  }
);

export default About;
