import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import cloveImg from './assets/images/clove.png'

const earthModelUrl = new URL('./assets/3D model/earth.glb', import.meta.url).href

const alphaEarthStats = {
  title: 'ALPHA EARTH',
  sections: [
    {
      heading: 'METRICS',
      rows: [
        { label: 'MASS', value: '1.2e38' },
        { label: 'VELOCITY', value: '-0.89c' },
        { label: 'ENTROPY', value: '4.2e15' },
        { label: 'DENSITY', value: '2.8e12' },
        { label: 'FIELD', value: '6.7e8' },
      ],
    },
    {
      heading: 'COORDINATES',
      rows: [
        { label: 'X', value: '-3.14e6' },
        { label: 'Y', value: '8.92e5' },
        { label: 'Z', value: '1.45e4' },
      ],
    },
    {
      heading: 'EVENT STATUS',
      rows: [
        { label: 'SYSTEM', value: 'READY' },
        { label: 'STATE', value: 'AWAITING INPUT' },
      ],
    },
  ],
}

const omegaEarthStats = {
  title: 'OMEGA EARTH',
  sections: [
    {
      heading: 'METRICS',
      rows: [
        { label: 'MASS', value: '9.7e37' },
        { label: 'VELOCITY', value: '0.31c' },
        { label: 'ENTROPY', value: '6.1e15' },
        { label: 'DENSITY', value: '3.1e12' },
        { label: 'FIELD', value: '4.9e8' },
      ],
    },
    {
      heading: 'COORDINATES',
      rows: [
        { label: 'X', value: '3.99e6' },
        { label: 'Y', value: '-7.44e5' },
        { label: 'Z', value: '-2.11e4' },
      ],
    },
    {
      heading: 'EVENT STATUS',
      rows: [
        { label: 'SYSTEM', value: 'SYNCED' },
        { label: 'STATE', value: 'MONITORING' },
      ],
    },
  ],
}

type DotDef = {
  pos: THREE.Vector3
  label: string
  nodeId: string
  status: string
  ping: string
  load: string
  signal: string
  freq: string
  lat: string
  lng: string
}

const ALPHA_DOTS: DotDef[] = [
  {
    pos: new THREE.Vector3(0.62, 0.48, 0.62).normalize(),
    label: 'ALPHA-1', nodeId: 'QN-0042',
    status: 'ONLINE', ping: '2ms', load: '14%', signal: '98%', freq: '128.4Hz',
    lat: '43.2405° N', lng: '73.0685° W',
  },
  {
    pos: new THREE.Vector3(-0.5, -0.28, 0.82).normalize(),
    label: 'ALPHA-2', nodeId: 'QN-0117',
    status: 'DEGRADED', ping: '18ms', load: '67%', signal: '76%', freq: '94.1Hz',
    lat: '12.8741° S', lng: '28.3310° E',
  },
  {
    pos: new THREE.Vector3(0.18, -0.62, 0.76).normalize(),
    label: 'ALPHA-3', nodeId: 'QN-0203',
    status: 'ONLINE', ping: '5ms', load: '31%', signal: '91%', freq: '110.7Hz',
    lat: '33.8688° S', lng: '151.2093° E',
  },
]

const OMEGA_DOTS: DotDef[] = [
  {
    pos: new THREE.Vector3(-0.58, 0.44, 0.68).normalize(),
    label: 'OMEGA-1', nodeId: 'QN-0398',
    status: 'ONLINE', ping: '3ms', load: '22%', signal: '96%', freq: '131.2Hz',
    lat: '51.5074° N', lng: '0.1278° W',
  },
  {
    pos: new THREE.Vector3(0.44, -0.22, 0.87).normalize(),
    label: 'OMEGA-2', nodeId: 'QN-0451',
    status: 'ONLINE', ping: '9ms', load: '55%', signal: '83%', freq: '108.9Hz',
    lat: '35.6762° N', lng: '139.6503° E',
  },
  {
    pos: new THREE.Vector3(-0.12, -0.58, 0.81).normalize(),
    label: 'OMEGA-3', nodeId: 'QN-0512',
    status: 'ONLINE', ping: '6ms', load: '41%', signal: '89%', freq: '119.3Hz',
    lat: '23.1291° N', lng: '113.2644° E',
  },
]

function disposeMaterial(material: THREE.Material) {
  const m = material as THREE.Material & Record<string, { dispose?: () => void } | undefined>
    ;['alphaMap', 'aoMap', 'bumpMap', 'displacementMap', 'emissiveMap', 'envMap',
      'lightMap', 'map', 'metalnessMap', 'normalMap', 'roughnessMap', 'specularMap',
    ].forEach((k) => m[k]?.dispose?.())
  material.dispose()
}

function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      if (Array.isArray(child.material)) child.material.forEach(disposeMaterial)
      else disposeMaterial(child.material)
    }
  })
}



function NodePanel({ dot, onClose }: { dot: DotDef; onClose: () => void }) {
  return (
    <div className="node-overlay" onClick={onClose}>
      <div className="node-panel" onClick={(e) => e.stopPropagation()}>

        <div className="node-panel__visual">
          <div className="node-panel__banner">
            <span className="node-panel__coords">NODE&nbsp;&nbsp;{dot.lat} / {dot.lng}</span>
            <h2 className="node-panel__name">{dot.label}</h2>
          </div>
          <div className="node-panel__scan">
            <div className="node-panel__scan-lines" aria-hidden="true" />
            <p className="node-panel__scan-label">QUANTUM RELAY ACTIVE</p>
            <p className="node-panel__scan-id">ID: {dot.nodeId}</p>
          </div>
          <div className="node-panel__footer-bar">
            <span className="node-panel__case">
              CASE:&nbsp; Node {dot.label} relay established. Signal lock {dot.status === 'ONLINE' ? 'confirmed' : 'degraded'}. Awaiting authorisation.
            </span>
          </div>
        </div>


        <div className="node-panel__sidebar">
          <button className="node-panel__close" onClick={onClose} aria-label="Close">✕</button>

          <div className="node-panel__card">
            <h3 className="node-panel__card-title">SYSTEM STATUS</h3>
            <div className="node-panel__card-rows">
              <div className="node-panel__row"><span>QUANTUM_BRIDGE</span><span className="node-panel__dot-ind" /></div>
              <div className="node-panel__row"><span>EVENT_MONITOR</span><span className="node-panel__dot-ind" /></div>
              <div className="node-panel__row"><span>GRAV_LENS FREQUENCY</span><span>{dot.freq}</span></div>
              <div className="node-panel__row"><span>SIGNAL</span><span>{dot.signal}</span></div>
              <div className="node-panel__row"><span>PING</span><span>{dot.ping}</span></div>
              <div className="node-panel__row"><span>LOAD</span><span>{dot.load}</span></div>
              <div className="node-panel__row"><span>STATUS</span>
                <span className={dot.status === 'ONLINE' ? 'node-panel__status--ok' : 'node-panel__status--warn'}>
                  {dot.status}
                </span>
              </div>
            </div>
          </div>

          <div className="node-panel__card">
            <h3 className="node-panel__card-title">LOCATION</h3>
            <div className="node-panel__card-rows">
              <div className="node-panel__row"><span>LAT:</span><span>{dot.lat}</span></div>
              <div className="node-panel__row"><span>LONG:</span><span>{dot.lng}</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}



type EarthModelProps = {
  className: string
  mirrored?: boolean
  onDotClick: (dot: DotDef) => void
}

function makeDotTexture(): THREE.CanvasTexture {
  const sz = 128
  const c = document.createElement('canvas')
  c.width = sz; c.height = sz
  const ctx = c.getContext('2d')!
  const cx = sz / 2
  // Outer glow
  const g = ctx.createRadialGradient(cx, cx, 3, cx, cx, cx)
  g.addColorStop(0, 'rgba(57,255,132,1)')
  g.addColorStop(0.18, 'rgba(57,255,132,0.9)')
  g.addColorStop(0.45, 'rgba(57,255,132,0.3)')
  g.addColorStop(1, 'rgba(57,255,132,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, sz, sz)
  // Bright centre
  ctx.beginPath(); ctx.arc(cx, cx, 6, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill()
  return new THREE.CanvasTexture(c)
}

function EarthModel({ className, mirrored = false, onDotClick }: EarthModelProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const dots = mirrored ? OMEGA_DOTS : ALPHA_DOTS

  useEffect(() => {
    const host = canvasHostRef.current
    if (!host) return
    let disposed = false

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0, 5.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.85
    host.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.45, 0.5)
    composer.addPass(bloomPass)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.enableZoom = false
    controls.target.set(0, 0, 0)
    controls.update()

    scene.add(new THREE.AmbientLight(0xf4f7ff, 0.55))
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.95)
    keyLight.position.set(3, 2, 5); scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0x6e95ff, 2.2)
    rimLight.position.set(-4, -1, -3); scene.add(rimLight)
    const backLight = new THREE.DirectionalLight(0x3a7fff, 1.4)
    backLight.position.set(0, 3, -5); scene.add(backLight)

    const modelGroup = new THREE.Group()
    const glowGroup = new THREE.Group()
    scene.add(glowGroup); scene.add(modelGroup)

    let animationFrame = 0
    const dotWorldPositions: THREE.Vector3[] = []
    const dotSprites: THREE.Sprite[] = []
    const dotTexture = makeDotTexture()

    const handleResize = () => {
      const { width, height } = host.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      composer.setSize(width, height)
      bloomPass.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      composer.render()
    }

    const tick = () => {
      controls.update()

      if (dotWorldPositions.length === 3) {
        const camDir = camera.position.clone().normalize()
        dotWorldPositions.forEach((wp, i) => {
          const facing = wp.clone().normalize().dot(camDir) > 0.05
          dotSprites[i].visible = true
        })
      }
      composer.render()
      animationFrame = window.requestAnimationFrame(tick)
    }


    const raycaster = new THREE.Raycaster()
    const handleCanvasClick = (e: MouseEvent) => {
      if (dotWorldPositions.length !== 3) return
      const rect = renderer.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        ((e.clientY - rect.top) / rect.height) * -2 + 1,
      )
      raycaster.setFromCamera(mouse, camera)
      const camDir = camera.position.clone().normalize()
      let best: DotDef | null = null
      let bestDist = 0.18
      dotWorldPositions.forEach((wp, i) => {
        if (wp.clone().normalize().dot(camDir) < 0.05) return
        const d = raycaster.ray.distanceToPoint(wp)
        if (d < bestDist) { bestDist = d; best = dots[i] }
      })
      if (best) onDotClick(best)
    }
    renderer.domElement.addEventListener('click', handleCanvasClick)

    new GLTFLoader().load(
      earthModelUrl,
      (gltf) => {
        if (disposed) { disposeObject3D(gltf.scene); return }
        const earth = gltf.scene
        const bounds = new THREE.Box3().setFromObject(earth)
        const center = new THREE.Vector3(); const size = new THREE.Vector3()
        bounds.getCenter(center); bounds.getSize(size)
        earth.position.sub(center)
        const targetSize = 4
        earth.scale.setScalar(targetSize / (Math.max(size.x, size.y, size.z) || 1))
        earth.rotation.x = 0.12
        earth.rotation.y = mirrored ? Math.PI * 0.82 : -Math.PI * 0.22
        earth.rotation.z = mirrored ? -0.05 : 0.05


        const r = targetSize * 0.5
        dots.forEach((d) => {
          const wp = d.pos.clone().multiplyScalar(r * 1.06)
          dotWorldPositions.push(d.pos.clone().multiplyScalar(r))
          const mat = new THREE.SpriteMaterial({
            map: dotTexture,
            transparent: true,
            depthTest: false,
            sizeAttenuation: true,
          })
          const sprite = new THREE.Sprite(mat)
          sprite.position.copy(wp)
          sprite.scale.set(.4, .4, .1)
          scene.add(sprite)
          dotSprites.push(sprite)
        })

        const glowShell = earth.clone(true)
        earth.traverse((c) => { if (c instanceof THREE.Mesh) c.frustumCulled = false })
        glowShell.traverse((c) => {
          if (c instanceof THREE.Mesh) {
            c.geometry = c.geometry.clone()
            c.material = new THREE.MeshBasicMaterial({
              color: mirrored ? 0x8fb1ff : 0xa2c1ff, transparent: true, opacity: 0.18,
              side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
            c.scale.multiplyScalar(1.07); c.frustumCulled = false
          }
        })
        glowGroup.clear(); modelGroup.clear()
        glowGroup.add(glowShell); modelGroup.add(earth)
        handleResize(); controls.update()
      },
      undefined,
      (err) => console.error('Earth load error', err),
    )

    window.addEventListener('resize', handleResize)
    handleResize()
    animationFrame = window.requestAnimationFrame(tick)

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('click', handleCanvasClick)
      controls.dispose(); glowGroup.clear(); modelGroup.clear()
      dotSprites.forEach((s) => { s.material.dispose(); scene.remove(s) })
      dotTexture.dispose()
      composer.dispose(); renderer.dispose()
      if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement)
    }
  }, [mirrored])

  return (
    <div
      ref={canvasHostRef}
      className={className}
      style={{ borderRadius: '50%', overflow: 'hidden' }}
      aria-hidden="true"
    />
  )
}


function EarthOverviewPage({ onBridgeActivate }: { onBridgeActivate: () => void }) {
  const [activeDot, setActiveDot] = useState<DotDef | null>(null)

  return (
    <main className="overview-screen">
      <div className="starfield" aria-hidden="true">
        {Array.from({ length: 280 }).map((_, i) => {
          const left = (i * 11.7 + (i % 9) * 2.9) % 100
          const top = (i * 23.9 + (i % 7) * 7) % 100
          const size = i % 11 === 0 ? 2.4 : i % 5 === 0 ? 1.6 : 0.9
          return (
            <span key={i} className="star" style={{ left: `${left}%`, top: `${top}%`, width: `${size}px`, height: `${size}px`, animationDelay: `${(i % 18) * 0.14}s` }} />
          )
        })}
      </div>

      <div className="earth-glow earth-glow--left" aria-hidden="true" />
      <div className="earth-glow earth-glow--right" aria-hidden="true" />

      <img src={cloveImg} className="clove-image" alt="" aria-hidden="true" />

      <EarthModel className="earth-model earth-model--left" mirrored={false} onDotClick={setActiveDot} />
      <EarthModel className="earth-model earth-model--right" mirrored onDotClick={setActiveDot} />

      <section className="overview-column overview-column--left">
        <article className="planet-card">
          <p className="planet-card__eyebrow">PRIMARY SIGNAL</p>
          <h2>{alphaEarthStats.title}</h2>
          {alphaEarthStats.sections.map((s) => (
            <div key={s.heading} className="planet-group">
              <h3>{s.heading}</h3>
              <dl>{s.rows.map((r) => <div key={r.label}><dt>{r.label}</dt><dd>{r.value}</dd></div>)}</dl>
            </div>
          ))}
        </article>
      </section>

      <section className="overview-column overview-column--right">
        <article className="planet-card planet-card--right">
          <p className="planet-card__eyebrow">SECONDARY SIGNAL</p>
          <h2>{omegaEarthStats.title}</h2>
          {omegaEarthStats.sections.map((s) => (
            <div key={s.heading} className="planet-group">
              <h3>{s.heading}</h3>
              <dl>{s.rows.map((r) => <div key={r.label}><dt>{r.label}</dt><dd>{r.value}</dd></div>)}</dl>
            </div>
          ))}
        </article>
      </section>

      <footer className="overview-bottom-bar">
        <span className="overview-bottom-bar__meta">RUNTIME: 00:00:00</span>
        <button
          type="button"
          className="overview-bottom-bar__button"
          onClick={onBridgeActivate}
          style={{ cursor: 'none' }}
        >
          ASCEND
        </button>

      </footer>

      {activeDot && <NodePanel dot={activeDot} onClose={() => setActiveDot(null)} />}
    </main>
  )
}

export default EarthOverviewPage
