import { useTexture, Plane } from "@react-three/drei";
import { DoubleSide } from "three";

function FilmFrame() {
  const filmTexture = useTexture("/film/super8.png");

  return (
    <Plane args={[2, 1]} position={[0, 0, 0.1]}>
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
