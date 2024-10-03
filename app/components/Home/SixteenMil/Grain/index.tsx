import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  useVideoTexture,
  useTexture,
  Plane,
  shaderMaterial,
} from "@react-three/drei";
import { DoubleSide, ShaderMaterial, VideoTexture } from "three";
import { extend } from "@react-three/fiber";

const AlphaMaskMaterial = shaderMaterial(
  {
    grainTexture: null,
    lightTexture: null,
    filmTexture: null,
    opacity: 0.5,
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform sampler2D grainTexture;
    uniform sampler2D lightTexture;
    uniform sampler2D filmTexture;
    uniform float opacity;
    varying vec2 vUv;
    void main() {
      vec4 filmColor = texture2D(filmTexture, vUv);
      vec4 grainColor = texture2D(grainTexture, vUv);
      vec4 lightColor = texture2D(lightTexture, vUv);
      
      // Use the inverse of the film's alpha channel as a mask
      float mask = 1.0 - filmColor.a;
      
      vec3 finalColor = mix(grainColor.rgb, lightColor.rgb, 0.5);
      gl_FragColor = vec4(finalColor, mask * opacity);
    }
  `
);

extend({ AlphaMaskMaterial });

function GrainOverlay() {
  const grainVideoRef = useRef<HTMLVideoElement>(null);
  const lightVideoRef = useRef<HTMLVideoElement>(null);

  const grainTexture = useVideoTexture("/film/film-grain.mp4", {
    loop: true,
    muted: true,
    crossOrigin: "anonymous",
  });

  const lightTexture = useVideoTexture("/film/light-overlay.mp4", {
    loop: true,
    muted: true,
    crossOrigin: "anonymous",
  });

  const filmTexture = useTexture("/film/super8.png");

  const materialRef = useRef<ShaderMaterial>(null);

  useEffect(() => {
    if (grainVideoRef.current) {
      grainVideoRef.current.playbackRate = 0.25;
    }
    if (lightVideoRef.current) {
      lightVideoRef.current.playbackRate = 0.25;
    }
  }, []);

  useFrame(() => {
    if (grainVideoRef.current && grainVideoRef.current.paused) {
      grainVideoRef.current.play();
    }
    if (lightVideoRef.current && lightVideoRef.current.paused) {
      lightVideoRef.current.play();
    }
  });

  const materialProps = useMemo(
    () => ({
      grainTexture,
      lightTexture,
      filmTexture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      side: DoubleSide,
    }),
    [grainTexture, lightTexture, filmTexture]
  );

  return (
    <Plane args={[2, 1]} position={[0, 0, 0.1]}>
      {/* @ts-ignore */}
      <alphaMaskMaterial ref={materialRef} {...materialProps} />
    </Plane>
  );
}

export default GrainOverlay;
