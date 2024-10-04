import { useTexture, Plane } from "@react-three/drei";
import { DoubleSide } from "three";

interface FilmFrameProps {
  position?: [number, number, number];
}

function FilmFrame({ position = [0, 0, 0.1] }: FilmFrameProps) {
  const filmTexture = useTexture("/film/super8.png");

  return (
    <Plane args={[2, 1]} position={position}>
      <meshBasicMaterial
        map={filmTexture}
        transparent
        side={DoubleSide}
        alphaTest={0.1}
      />
    </Plane>
  );
}

export default FilmFrame;
