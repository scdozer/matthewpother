import React, { useState, useCallback } from "react";
import { Projects } from "@/sanity/utils/graphql";
import ScrollView from "./ScrollView";
import GridView from "./GridView";
import styles from "./styles.module.scss";

interface EndlessScrollProps {
  projects: Projects[];
}

const EndlessScroll: React.FC<EndlessScrollProps> = ({ projects }) => {
  const [isGridView, setIsGridView] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const toggleView = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
    }
  }, [isTransitioning]);

  const onTransitionComplete = useCallback((newView: "grid" | "scroll") => {
    setIsGridView(newView === "grid");
    setIsTransitioning(false);
  }, []);

  return (
    <div>
      <button
        onClick={toggleView}
        className={styles.viewToggleButton}
        disabled={isTransitioning}
      >
        {isGridView ? "Switch to Scroll View" : "Switch to Grid View"}
      </button>
      {!isGridView && (
        <ScrollView
          projects={projects}
          isTransitioning={isTransitioning}
          onTransitionComplete={onTransitionComplete}
        />
      )}
      {isGridView && (
        <GridView
          projects={projects}
          isTransitioning={isTransitioning}
          onTransitionComplete={onTransitionComplete}
        />
      )}
    </div>
  );
};

export default EndlessScroll;
