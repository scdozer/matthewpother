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
    grainIntensity: 0.4,
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
    uniform float grainIntensity;
    varying vec2 vUv;
    void main() {
      vec4 filmColor = texture2D(filmTexture, vUv);
      vec4 grainColor = texture2D(grainTexture, vUv);
      vec4 lightColor = texture2D(lightTexture, vUv);
      
      float mask = 1.0 - filmColor.a;
      
      vec3 grainLightMix = mix(grainColor.rgb, lightColor.rgb, 0.5);
      vec3 finalColor = mix(vec3(1.0), grainLightMix, grainIntensity);
      
      gl_FragColor = vec4(finalColor, mask * opacity);
    }
  `
);

extend({ AlphaMaskMaterial });

interface GrainOverlayProps {
  position?: [number, number, number];
}

function GrainOverlay({ position = [0, 0, 0.1] }: GrainOverlayProps) {
  const grainVideoRef = useRef<HTMLVideoElement>(null);
  const lightVideoRef = useRef<HTMLVideoElement>(null);

  const grainTexture = useVideoTexture("/film/film-grain.mp4", {
    loop: true,
    muted: true,
    crossOrigin: "anonymous",
    start: false,
  });

  const lightTexture = useVideoTexture("/film/light-overlay.mp4", {
    loop: true,
    muted: true,
    crossOrigin: "anonymous",
    start: false,
  });

  const filmTexture = useTexture("/film/super8.png");

  const materialRef = useRef<ShaderMaterial>(null);

  useEffect(() => {
    const grainVideo = (grainTexture as VideoTexture).source.data;
    const lightVideo = (lightTexture as VideoTexture).source.data;

    if (grainVideoRef.current) {
      grainVideoRef.current.src = grainVideo.src;
    }
    if (lightVideoRef.current) {
      lightVideoRef.current.src = lightVideo.src;
    }

    grainVideo.playbackRate = 0.25;
    lightVideo.playbackRate = 0.25;

    const playVideos = () => {
      grainVideo
        .play()
        .catch((error: any) =>
          console.error("Error playing grain video:", error)
        );
      lightVideo
        .play()
        .catch((error: any) =>
          console.error("Error playing light video:", error)
        );
    };

    playVideos();

    const handleUserInteraction = () => {
      playVideos();
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, [grainTexture, lightTexture]);

  useFrame(() => {
    if (grainVideoRef.current && grainVideoRef.current.paused) {
      grainVideoRef.current
        .play()
        .catch((error) => console.error("Error playing grain video:", error));
    }
    if (lightVideoRef.current && lightVideoRef.current.paused) {
      lightVideoRef.current
        .play()
        .catch((error) => console.error("Error playing light video:", error));
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
    <Plane args={[2, 1]} position={position}>
      {/* @ts-ignore */}
      <alphaMaskMaterial ref={materialRef} {...materialProps} />
    </Plane>
  );
}

export default GrainOverlay;
