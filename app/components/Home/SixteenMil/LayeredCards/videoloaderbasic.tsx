import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Projects } from "@/sanity/utils/graphql";

interface LayeredCardProps {
  projects: Projects[];
  currentIndex: number;
}

const LayeredCard: React.FC<LayeredCardProps> = ({
  projects,
  currentIndex,
}) => {
  console.log("LayeredCard render, currentIndex:", currentIndex);

  const meshRef = useRef<THREE.Mesh>(null);
  const [textures, setTextures] = useState<THREE.Texture[]>([]);
  const [currentTexture, setCurrentTexture] = useState<THREE.Texture | null>(
    null
  );

  useEffect(() => {
    const loadTextures = async () => {
      const loadedTextures = await Promise.all(
        projects.map((project, index) => {
          const url =
            project.mainVideo?.asset?.url || project.image?.asset?.url || "";
          if (
            url.endsWith(".mp4") ||
            url.endsWith(".mov") ||
            url.endsWith(".webm")
          ) {
            const video = document.createElement("video");
            video.src = url;
            video.crossOrigin = "anonymous";
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.load();
            return new Promise<THREE.Texture>((resolve) => {
              video.oncanplay = () => {
                video.play().catch(console.error);
                const texture = new THREE.VideoTexture(video);
                console.log(`Loaded video texture for index ${index}`);
                resolve(texture);
              };
            });
          } else {
            return new THREE.TextureLoader().loadAsync(url).then((texture) => {
              console.log(`Loaded image texture for index ${index}`);
              return texture;
            });
          }
        })
      );
      setTextures(loadedTextures);
      setCurrentTexture(loadedTextures[currentIndex]);
    };

    loadTextures();
  }, [projects]);

  useEffect(() => {
    console.log("Current index changed to:", currentIndex);
    if (textures[currentIndex]) {
      setCurrentTexture(textures[currentIndex]);
    }
  }, [currentIndex, textures]);

  useFrame(() => {
    if (currentTexture instanceof THREE.VideoTexture) {
      currentTexture.needsUpdate = true;
    }
  });

  if (!currentTexture) {
    return null;
  }

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1.6, 0.9]} />
      <meshBasicMaterial
        map={currentTexture}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default LayeredCard;
