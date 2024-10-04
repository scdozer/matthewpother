import { useRef, useMemo } from "react";
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
  const grainTexture = useVideoTexture("/film/film-grain.mp4", {
    loop: true,
    muted: true,
    crossOrigin: "anonymous",
    autoplay: true,
    playsInline: true,
  });

  const lightTexture = useVideoTexture("/film/light-overlay.mp4", {
    loop: true,
    muted: true,
    crossOrigin: "anonymous",
    autoplay: true,
    playsInline: true,
  });

  const filmTexture = useTexture("/film/super8.png");

  const materialRef = useRef<ShaderMaterial>(null);

  useFrame(() => {
    const grainVideo = (grainTexture as VideoTexture).source.data;
    const lightVideo = (lightTexture as VideoTexture).source.data;
    grainVideo.playbackRate = 0.25;
    lightVideo.playbackRate = 0.25;
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
