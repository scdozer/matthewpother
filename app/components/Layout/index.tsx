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

  useEffect(() => {
    if (showAbout) {
      gsap.to(aboutRef.current, {
        display: "block",
        duration: 0.5,
        top: "0",
        ease: "power2.out",
      });
    } else {
      gsap.to(aboutRef.current, {
        top: "100%",
        duration: 0.5,
        onComplete: () => {
          gsap.set(aboutRef.current, { display: "none" });
        },
      });
    }
  }, [showAbout]);

  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        <h1>
          <Link href="/">{layout.title}</Link>
        </h1>
        <div onClick={() => setShowAbout(true)} style={{ cursor: "pointer" }}>
          <PortableText value={layout.descriptionRaw} />
        </div>
      </div>

      <About
        ref={aboutRef}
        layout={layout}
        onClose={() => setShowAbout(false)}
      />
    </div>
  );
}
