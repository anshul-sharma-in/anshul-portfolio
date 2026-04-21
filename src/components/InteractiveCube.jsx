import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Text } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'

const FACES = [
  { label: 'About Me',   sub: 'who I am',     color: '#FF5800', textColor: '#ffffff', pos: [0, 0, 1.51],  rot: [0, 0, 0],                to: '/about' },
  { label: 'Projects',   sub: 'what I built', color: '#0045AD', textColor: '#ffffff', pos: [0, 0, -1.51], rot: [0, Math.PI, 0],          to: '/projects' },
  { label: 'Skills',     sub: 'tech stack',   color: '#009E60', textColor: '#ffffff', pos: [1.51, 0, 0],  rot: [0, Math.PI / 2, 0],      to: '/skills' },
  { label: 'Experience', sub: 'my journey',   color: '#C41E3A', textColor: '#ffffff', pos: [-1.51, 0, 0], rot: [0, -Math.PI / 2, 0],     to: '/experience' },
  { label: 'Contact',    sub: 'get in touch', color: '#FFD500', textColor: '#111111', pos: [0, 1.51, 0],  rot: [-Math.PI / 2, 0, 0],     to: '/contact' },
  { label: 'Interview',  sub: 'mock prep',    color: '#0D7377', textColor: '#ffffff', pos: [0, -1.51, 0], rot: [Math.PI / 2, 0, 0],      to: '/interview' },
]

function FacePlane({ label, sub, color, textColor, pos, rot, to }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const dragStart = useRef(null)

  const subColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'

  return (
    <group position={pos} rotation={rot}>
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation()
          dragStart.current = [e.clientX, e.clientY]
        }}
        onPointerUp={(e) => {
          e.stopPropagation()
          if (!dragStart.current) return
          const dx = e.clientX - dragStart.current[0]
          const dy = e.clientY - dragStart.current[1]
          if (dx * dx + dy * dy < 36) navigate(to)
          dragStart.current = null
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        <planeGeometry args={[2.86, 2.86]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          transparent
          opacity={hovered ? 1 : 0.88}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.22, 0.01]}
        fontSize={0.38}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {label}
      </Text>

      {/* Subtitle */}
      <Text
        position={[0, -0.26, 0.01]}
        fontSize={0.2}
        color={subColor}
        anchorX="center"
        anchorY="middle"
      >
        {sub}
      </Text>
    </group>
  )
}

export default function InteractiveCube({ height = '480px' }) {
  return (
    <div style={{ width: '100%', height }}>
      <Canvas camera={{ position: [5, 3.5, 5], fov: 40 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[8, 10, 6]} intensity={1.5} />
        <directionalLight position={[-6, -4, -4]} intensity={0.4} />
        <pointLight position={[3, 4, 3]} intensity={0.5} color="#FFD500" />

        {/* Black cube body */}
        <RoundedBox args={[3, 3, 3]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#0f0f0f" roughness={0.6} />
        </RoundedBox>

        {/* Colored faces */}
        {FACES.map((face) => (
          <FacePlane key={face.to} {...face} />
        ))}

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={0.65}
          enableDamping
          dampingFactor={0.1}
        />
      </Canvas>
    </div>
  )
}
