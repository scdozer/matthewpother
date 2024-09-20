"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import gsap from "gsap";

import { Layout as SanityLayout } from "../../../sanity/utils/graphql";
import About from "./About";

import styles from "./styles.module.scss";

export default function Layout({ layout }: { layout: SanityLayout }) {
  const [showAbout, setShowAbout] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showAbout) {
      gsap.to(aboutRef.current, {
        display: "flex",
        duration: 0.5,
        top: "0",
        ease: "power2.inOut",
      });
    } else {
      gsap.to(aboutRef.current, {
        top: "100%",
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(aboutRef.current, { display: "none" });
        },
      });
    }
  }, [showAbout]);

  useEffect(() => {
    gsap.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 1,
      ease: "power2.out",
    });
    gsap.to(descriptionRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 1,
      ease: "power2.out",
    });
  }, []);

  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        <h1 ref={titleRef}>
          <Link href="/">{layout.title}</Link>
        </h1>
        <div ref={descriptionRef}>
          <button onClick={() => setShowAbout(true)}>more info</button>
          <PortableText value={layout.descriptionRaw} />
        </div>
      </div>

      <About
        ref={aboutRef}
        layout={layout}
        onClose={() => setShowAbout(false)}
        showAbout={showAbout}
      />
    </div>
  );
}
