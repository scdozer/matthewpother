import React, { forwardRef } from "react";
import styles from "./styles.module.scss";
import { PortableText } from "@portabletext/react";
import { Layout as SanityLayout } from "../../../../sanity/utils/graphql";

interface AboutProps {
  layout: SanityLayout;
  onClose: () => void;
}

const About = forwardRef<HTMLDivElement, AboutProps>(
  ({ layout, onClose }, ref) => {
    return (
      <div ref={ref} className={styles.about}>
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
        <h2>About</h2>
        <PortableText value={layout.descriptionRaw} />
      </div>
    );
  }
);

export default About;
