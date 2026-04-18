import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'

// Standard Rubik's cube face colors keyed by which wall of the 3×3 they face
const FACE_COLORS = {
  px: '#FF5800',  // right  = Orange
  nx: '#C41E3A',  // left   = Red
  py: '#FFD500',  // top    = Yellow
  ny: '#FFFFFF',  // bottom = White
  pz: '#009E60',  // front  = Green
  nz: '#0045AD',  // back   = Blue
}

// Each face: the offset from piece center and rotation to face outward
const FACES = [
  { dir: 'px', pos: [0.502, 0, 0],   rot: [0, Math.PI / 2, 0]  },
  { dir: 'nx', pos: [-0.502, 0, 0],  rot: [0, -Math.PI / 2, 0] },
  { dir: 'py', pos: [0, 0.502, 0],   rot: [-Math.PI / 2, 0, 0] },
  { dir: 'ny', pos: [0, -0.502, 0],  rot: [Math.PI / 2, 0, 0]  },
  { dir: 'pz', pos: [0, 0, 0.502],   rot: [0, 0, 0]             },
  { dir: 'nz', pos: [0, 0, -0.502],  rot: [0, Math.PI, 0]       },
]

// A face sticker is visible only if the piece sits on that outer wall of the cube
function stickerColor(dir, [x, y, z]) {
  if (dir === 'px' && x === 1)  return FACE_COLORS.px
  if (dir === 'nx' && x === -1) return FACE_COLORS.nx
  if (dir === 'py' && y === 1)  return FACE_COLORS.py
  if (dir === 'ny' && y === -1) return FACE_COLORS.ny
  if (dir === 'pz' && z === 1)  return FACE_COLORS.pz
  if (dir === 'nz' && z === -1) return FACE_COLORS.nz
  return null // inner face — not rendered
}

function CubePiece({ position }) {
  return (
    <group position={position}>
      {/* Black plastic body */}
      <RoundedBox args={[0.93, 0.93, 0.93]} radius={0.07} smoothness={3}>
        <meshStandardMaterial color="#111111" roughness={0.5} />
      </RoundedBox>
      {/* Colored stickers — only on outer faces */}
      {FACES.map(({ dir, pos, rot }) => {
        const color = stickerColor(dir, position)
        if (!color) return null
        return (
          <mesh key={dir} position={pos} rotation={rot}>
            <planeGeometry args={[0.80, 0.80]} />
            <meshStandardMaterial color={color} roughness={0.15} metalness={0.05} />
          </mesh>
        )
      })}
    </group>
  )
}

function RotatingCube() {
  const groupRef = useRef()

  const positions = useMemo(() => {
    const pos = []
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++)
          pos.push([x, y, z])
    return pos
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.3
    }
  })

  return (
    <group ref={groupRef} scale={[0.9, 0.9, 0.9]}>
      {positions.map((pos, i) => (
        <CubePiece key={i} position={pos} />
      ))}
    </group>
  )
}

export default function RubiksCube3D({ height = '400px' }) {
  return (
    <div style={{ width: '100%', height }}>
      <Canvas camera={{ position: [4.5, 3.5, 4.5], fov: 42 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[8, 10, 6]} intensity={1.6} castShadow />
        <directionalLight position={[-6, -4, -4]} intensity={0.35} />
        <pointLight position={[3, 4, 3]} intensity={0.6} color="#FFD500" />
        <RotatingCube />
      </Canvas>
    </div>
  )
}
