import React, { useRef, useEffect, useMemo, useState } from "react";
import { useFrame, extend, ReactThreeFiber } from "@react-three/fiber";
import { shaderMaterial, useTexture } from "@react-three/drei";
import { Group, Texture, VideoTexture, Mesh, ShaderMaterial } from "three";
import * as THREE from "three";
import { Projects } from "@/sanity/utils/graphql";
import { gsap } from "gsap";

// Define the shader material
const LayeredMaterial = shaderMaterial(
  {
    uAlpha: 1,
    uTexture1: null,
    uTexture2: null,
    uProgress: 1,
    uDisplacement: null,
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,
  // Fragment Shader
  `
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform sampler2D uDisplacement;
  uniform float uProgress;
  uniform float uAlpha;
  varying vec2 vUv;

  void main() {
      vec4 displacement = texture2D(uDisplacement, vUv);
      float displacementValue = displacement.r;

      vec4 t1 = texture2D(uTexture1, vUv);
      vec4 t2 = texture2D(uTexture2, vUv);
      
      // Dithering transition
      float transition = smoothstep(uProgress, uProgress + 0.1, displacementValue);
      vec4 mixed = mix(t1, t2, transition);

      float limit = 0.75;
      float smoothDelta = 0.25;
      float computedLimit = limit - mix(0.0, limit, uAlpha);

      float byColorAlpha = smoothstep(
          max(0.0, computedLimit - smoothDelta),
          computedLimit,
          1.0 - dot(mixed.rgb, vec3(0.333))
      );

      float alpha = max(byColorAlpha, uAlpha);

      gl_FragColor = vec4(mixed.rgb, alpha);
  }
`
);

// Extend three.js with our custom material
extend({ LayeredMaterial });

interface LayeredMaterialImpl extends ShaderMaterial {
  uniforms: {
    uAlpha: { value: number };
    uTexture1: { value: Texture | null };
    uTexture2: { value: Texture | null };
    uProgress: { value: number };
    uDisplacement: { value: Texture | null };
  };
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      layeredMaterial: ReactThreeFiber.MaterialNode<
        LayeredMaterialImpl,
        [Record<string, unknown>]
      >;
    }
  }
}

interface LayeredCardProps {
  projects: Projects[];
  currentIndex: number;
}

const planeCount = 15;
const distance = 0.04;

const LayeredCard: React.FC<LayeredCardProps> = ({
  projects,
  currentIndex,
}) => {
  const groupRef = useRef<Group>(null);
  const planeRefs = useRef<Mesh[]>([]);
  const texturesRef = useRef<(Texture | VideoTexture)[]>([]);
  const prevIndexRef = useRef(currentIndex);
  const transitionProgressRef = useRef({ value: 1 }); // Start with full visibility
  const materialsRef = useRef<LayeredMaterialImpl[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load displacement texture
  const displacementTexture = useTexture("/displacement.jpg");

  // Load textures (images and videos)
  useEffect(() => {
    const loadTextures = async () => {
      const loadedTextures = await Promise.all(
        projects.map(async (project) => {
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
            await new Promise<void>((resolve) => {
              video.oncanplaythrough = () => {
                video.play().catch(console.error);
                resolve();
              };
            });
            return new THREE.VideoTexture(video);
          } else {
            return new THREE.TextureLoader().loadAsync(url);
          }
        })
      );
      texturesRef.current = loadedTextures;
      setInitialized(true); // Trigger re-render after textures are loaded
    };
    loadTextures();
  }, [projects]);

  // Initialize the first texture
  useEffect(() => {
    if (texturesRef.current.length > 0 && initialized) {
      materialsRef.current.forEach((material) => {
        material.uniforms.uTexture1.value = texturesRef.current[currentIndex];
        material.uniforms.uTexture2.value = texturesRef.current[currentIndex];
        material.uniforms.uProgress.value = 1; // Ensure the first texture is fully visible
      });
    }
  }, [texturesRef.current, currentIndex, initialized]);

  // Handle index change and animate transition
  useEffect(() => {
    if (
      texturesRef.current.length === 0 ||
      !texturesRef.current[currentIndex] ||
      !texturesRef.current[prevIndexRef.current]
    )
      return;

    materialsRef.current.forEach((material) => {
      material.uniforms.uTexture1.value = texturesRef.current[currentIndex];
      material.uniforms.uTexture2.value =
        texturesRef.current[prevIndexRef.current];
      material.uniforms.uProgress.value = 0;
    });
    transitionProgressRef.current.value = 0;

    // Animate the progress uniform
    gsap.to(transitionProgressRef.current, {
      value: 1,
      duration: 1,
      ease: "power2.inOut",
      onUpdate: () => {
        materialsRef.current.forEach((material) => {
          material.uniforms.uProgress.value =
            transitionProgressRef.current.value;
          material.uniformsNeedUpdate = true;
        });
      },
      onComplete: () => {
        prevIndexRef.current = currentIndex;
      },
    });
  }, [currentIndex]);

  // Animate uAlpha for each plane
  useEffect(() => {
    if (!initialized) return;

    const duration = 5;
    materialsRef.current.forEach((material, i) => {
      gsap.to(material.uniforms.uAlpha, {
        ease: "none",
        keyframes: {
          "0%": { value: 1 },
          "50%": { value: 0 },
          "100%": { value: 1 },
        },
        duration: 5,
        repeat: -1,
        delay: i * (duration / planeCount),
        onUpdate: () => {
          material.uniformsNeedUpdate = true;
        },
      });
    });
  }, [initialized]);

  useFrame(() => {
    // Update video textures
    texturesRef.current.forEach((texture) => {
      if (texture instanceof THREE.VideoTexture) {
        texture.needsUpdate = true;
      }
    });
  });

  if (texturesRef.current.length === 0) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {Array.from({ length: planeCount }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0, (planeCount / 2 - i) * distance]}
          ref={(el) => {
            if (el) planeRefs.current[i] = el;
          }}
        >
          <planeGeometry
            args={[1.6, 0.9]}
            ref={(geometry) => {
              if (geometry) {
                const uvs = geometry.attributes.uv.array;
                for (let j = 0; j < uvs.length; j += 4) {
                  [uvs[j], uvs[j + 2]] = [uvs[j + 2], uvs[j]];
                }
                geometry.attributes.uv.needsUpdate = true;
              }
            }}
          />
          <layeredMaterial
            ref={(material) => {
              if (material) {
                materialsRef.current[i] = material;
                material.uniforms.uTexture1.value =
                  texturesRef.current[currentIndex];
                material.uniforms.uTexture2.value =
                  texturesRef.current[prevIndexRef.current];
                material.uniforms.uDisplacement.value = displacementTexture;
              }
            }}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

export default LayeredCard;
