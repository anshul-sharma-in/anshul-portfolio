import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

// Face colors: +x, -x, +y, -y, +z, -z
const FACE_COLORS = ['#FF5800', '#C41E3A', '#FFD500', '#FFFFFF', '#009E60', '#0045AD']

function CubePiece({ position }) {
  const meshRef = useRef()
  return (
    <group position={position}>
      {FACE_COLORS.map((color, i) => {
        const faceOffset = [
          [0.505, 0, 0], [-0.505, 0, 0],
          [0, 0.505, 0], [0, -0.505, 0],
          [0, 0, 0.505], [0, 0, -0.505],
        ][i]
        return (
          <mesh key={i} position={faceOffset}>
            <planeGeometry args={[0.88, 0.88]} />
            <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
          </mesh>
        )
      })}
      <RoundedBox args={[0.96, 0.96, 0.96]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color="#111111" roughness={0.5} metalness={0.2} />
      </RoundedBox>
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
      <Canvas camera={{ position: [5, 3, 5], fov: 45 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#FFD500" />
        <RotatingCube />
      </Canvas>
    </div>
  )
}
