import React, { useEffect, useRef, useMemo } from "react";
import { Plane, useTexture, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Projects } from "@/sanity/utils/graphql";
import { extend } from "@react-three/fiber";
import { gsap } from "gsap";
import { DoubleSide } from "three";

interface SlideshowProps {
  projects: Projects[];
  currentIndex: number;
}

const DisplacementShaderMaterial = shaderMaterial(
  {
    uTexture1: new THREE.Texture(),
    uTexture2: new THREE.Texture(),
    uDisplacement: new THREE.Texture(),
    uProgress: 0,
    uPlaneSize: new THREE.Vector2(1, 1),
    uImageSize1: new THREE.Vector2(1, 1),
    uImageSize2: new THREE.Vector2(1, 1),
  },
  // vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    uniform sampler2D uTexture1;
    uniform sampler2D uTexture2;
    uniform sampler2D uDisplacement;
    uniform float uProgress;
    uniform vec2 uPlaneSize;
    uniform vec2 uImageSize1;
    uniform vec2 uImageSize2;
    varying vec2 vUv;

    vec2 coverScale(vec2 imageSize, vec2 planeSize) {
      float imageAspect = imageSize.x / imageSize.y;
      float planeAspect = planeSize.x / planeSize.y;
      vec2 scale = vec2(1.0);
      if (imageAspect > planeAspect) {
        scale.x = planeAspect / imageAspect;
      } else {
        scale.y = imageAspect / planeAspect;
      }
      return scale;
    }

    void main() {
      vec2 scale1 = coverScale(uImageSize1, uPlaneSize);
      vec2 scale2 = coverScale(uImageSize2, uPlaneSize);
      
      vec2 uv1 = (vUv - 0.5) / scale1 + 0.5;
      vec2 uv2 = (vUv - 0.5) / scale2 + 0.5;

      vec4 displacement = texture2D(uDisplacement, vUv);
      float displacementValue = displacement.r;

      vec4 t1 = texture2D(uTexture1, uv1);
      vec4 t2 = texture2D(uTexture2, uv2);
      
      float transition = smoothstep(uProgress, uProgress + 0.1, displacementValue);
      vec4 mixed = mix(t2, t1, transition);

      gl_FragColor = mixed;
    }
  `
);

extend({ DisplacementShaderMaterial });

function Slideshow({ projects, currentIndex }: SlideshowProps) {
  const renderCountRef = useRef(0);
  const prevIndexRef = useRef(currentIndex);

  useEffect(() => {
    renderCountRef.current += 1;
  });
  const images = useMemo(
    () => projects.map((project) => project.image?.asset?.url || ""),
    [projects]
  );
  const textures = useTexture(images);
  const displacementTexture = useTexture("/displacement.jpg");

  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const planeRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (currentIndex !== prevIndexRef.current) {
      gsap.to(materialRef.current!.uniforms.uProgress, {
        value: 1,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          prevIndexRef.current = currentIndex;
          if (materialRef.current) {
            materialRef.current.uniforms.uProgress.value = 0;
          }
          updateMaterialUniforms();
        },
      });
    }
  }, [currentIndex]);

  const updateMaterialUniforms = () => {
    if (materialRef.current && planeRef.current) {
      const texture1 = textures[prevIndexRef.current];
      const texture2 = textures[currentIndex];
      materialRef.current.uniforms.uTexture1.value = texture1;
      materialRef.current.uniforms.uTexture2.value = texture2;

      planeRef.current.geometry.computeBoundingBox();
      const planeSize = new THREE.Vector3();
      planeRef.current.geometry.boundingBox?.getSize(planeSize);

      materialRef.current.uniforms.uPlaneSize.value = new THREE.Vector2(
        planeSize.x,
        planeSize.y
      );
      materialRef.current.uniforms.uImageSize1.value = new THREE.Vector2(
        texture1.image.width,
        texture1.image.height
      );
      materialRef.current.uniforms.uImageSize2.value = new THREE.Vector2(
        texture2.image.width,
        texture2.image.height
      );
    }
  };

  useEffect(() => {
    updateMaterialUniforms();
  }, [currentIndex, prevIndexRef.current]);

  return (
    <Plane args={[2, 1]} ref={planeRef}>
      {/* @ts-ignore */}
      <displacementShaderMaterial
        ref={materialRef}
        uTexture1={textures[prevIndexRef.current]}
        uTexture2={textures[currentIndex]}
        uDisplacement={displacementTexture}
        uProgress={0}
        transparent
        side={DoubleSide}
      />
    </Plane>
  );
}

export default Slideshow;
