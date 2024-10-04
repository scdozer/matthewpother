import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { Projects } from "@/sanity/utils/graphql";

interface LayeredCardProps {
  projects: Projects[];
  currentIndex: number;
}

const LayeredCard = ({ projects, currentIndex }: LayeredCardProps) => {
  const groupRef = useRef<THREE.Group>();
  const planeRefs = useRef<THREE.Mesh[]>([]);
  const transitionProgressRef = useRef(0);
  const prevIndexRef = useRef(currentIndex);

  const planeCount = 15;
  const distance = 0.03;

  const images = useMemo(
    () => projects.map((project) => project.image?.asset?.url || ""),
    [projects]
  );
  const textures = useTexture(images);
  const displacementTexture = useTexture("/displacement.jpg");

  const uniforms = useMemo(() => {
    const u = Array(planeCount)
      .fill(null)
      .map(() => ({
        uAlpha: { value: 1 },
        uTexture1: { value: textures[0] },
        uTexture2: { value: textures[1] },
        uProgress: { value: 0 },
        uDisplacement: { value: displacementTexture },
      }));

    const duration = 1;

    u.forEach((uniform, i) => {
      gsap.to(uniform.uAlpha, {
        ease: "none",
        keyframes: {
          "0%": { value: 1 },
          "50%": { value: 0 },
          "100%": { value: 1 },
        },
        duration: 5,
        repeat: -1,
        delay: () => i * (duration / planeCount),
      });
    });

    return u;
  }, [textures, displacementTexture]);

  useEffect(() => {
    if (currentIndex !== prevIndexRef.current) {
      const texture1Index = currentIndex;
      const texture2Index =
        (prevIndexRef.current + projects.length) % projects.length;
      uniforms.forEach((u) => {
        u.uTexture1.value = textures[texture1Index];
        u.uTexture2.value = textures[texture2Index];
        u.uProgress.value = 0;
      });
      transitionProgressRef.current = 0;

      // Animate the transition
      gsap.to(transitionProgressRef, {
        current: 1,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          uniforms.forEach((u) => {
            u.uProgress.value = transitionProgressRef.current;
          });
        },
        onComplete: () => {
          prevIndexRef.current = currentIndex;
        },
      });
    }
  }, [currentIndex, textures, uniforms, projects.length]);

  const patch =
    (idx: number) =>
    (shader: {
      uniforms: any;
      vertexShader: string;
      fragmentShader: string;
    }) => {
      shader.uniforms = {
        ...shader.uniforms,
        ...uniforms[idx],
      };

      shader.vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `;

      shader.fragmentShader = `
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
            1.0 - (mixed.r + mixed.g + mixed.b) / 3.0
            );

            float alpha = max(byColorAlpha, uAlpha);

            gl_FragColor = vec4(mixed.rgb, alpha);
        }
        `;
    };

  useFrame(() => {
    // Remove setTransitionProgress and directly update uniforms
    const newProgress = Math.min(transitionProgressRef.current + 0.01, 1);
    uniforms.forEach((u) => {
      u.uProgress.value = newProgress;
    });
    transitionProgressRef.current = newProgress;
  });

  const planes = useMemo(() => {
    return Array(planeCount)
      .fill(null)
      .map((_, i) => {
        return (
          <mesh
            key={i}
            position={[0, 0, (planeCount / 2 - i) * distance]}
            ref={(el) => {
              if (el) planeRefs.current[i] = el;
            }}
          >
            <planeGeometry args={[1 * (1920 / 1080), 1, 1, 1]} />
            <meshBasicMaterial
              onBeforeCompile={patch(i)}
              side={THREE.DoubleSide}
              transparent
              customProgramCacheKey={() => i.toString()}
              needsUpdate
            />
          </mesh>
        );
      });
  }, [distance, planeCount]);

  return (
    <group
      ref={groupRef as React.RefObject<THREE.Group>}
      //   rotation={[0, 252, 0]}
      //   position={[3, 0, -1.5]}
      //   scale={[6, 6, 6]}
    >
      {planes}
    </group>
  );
};

export default LayeredCard;
