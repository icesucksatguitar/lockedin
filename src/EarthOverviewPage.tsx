import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

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

function disposeMaterial(material: THREE.Material) {
  const anyMaterial = material as THREE.Material & Record<string, { dispose?: () => void } | undefined>
  const textureKeys = [
    'alphaMap',
    'aoMap',
    'bumpMap',
    'displacementMap',
    'emissiveMap',
    'envMap',
    'lightMap',
    'map',
    'metalnessMap',
    'normalMap',
    'roughnessMap',
    'specularMap',
  ]

  textureKeys.forEach((key) => {
    const texture = anyMaterial[key]
    texture?.dispose?.()
  })

  material.dispose()
}

function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()

      if (Array.isArray(child.material)) {
        child.material.forEach((material) => disposeMaterial(material))
      } else {
        disposeMaterial(child.material)
      }
    }
  })
}

type EarthModelProps = {
  className: string
  mirrored?: boolean
}

function EarthModel({ className, mirrored = false }: EarthModelProps) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current

    if (!host) {
      return
    }

    let disposed = false

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)
    camera.position.set(0, 0, 5.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.72
    host.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.9, 0.55, 0.35)
    composer.addPass(renderPass)
    composer.addPass(bloomPass)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.enableZoom = false
    controls.enableRotate = true
    controls.target.set(0, 0, 0)
    controls.update()

    scene.add(new THREE.AmbientLight(0xf4f7ff, 0.55))

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.95)
    keyLight.position.set(3, 2, 5)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x6e95ff, 1.25)
    rimLight.position.set(-4, -1, -3)
    scene.add(rimLight)

    const modelGroup = new THREE.Group()
    const glowGroup = new THREE.Group()
    scene.add(glowGroup)
    scene.add(modelGroup)

    let animationFrame = 0

    const handleResize = () => {
      const { width, height } = host.getBoundingClientRect()

      if (!width || !height) {
        return
      }

      renderer.setSize(width, height, false)
      composer.setSize(width, height)
      bloomPass.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      composer.render()
    }

    const tick = () => {
      controls.update()
      composer.render()
      animationFrame = window.requestAnimationFrame(tick)
    }

    const loader = new GLTFLoader()
    loader.load(
      earthModelUrl,
      (gltf) => {
        if (disposed) {
          disposeObject3D(gltf.scene)
          return
        }

        const earth = gltf.scene
        const bounds = new THREE.Box3().setFromObject(earth)
        const center = new THREE.Vector3()
        const size = new THREE.Vector3()

        bounds.getCenter(center)
        bounds.getSize(size)

        earth.position.sub(center)

        const longestEdge = Math.max(size.x, size.y, size.z) || 1
        const targetSize = 3.35
        earth.scale.setScalar(targetSize / longestEdge)
        earth.rotation.x = 0.12
        earth.rotation.y = mirrored ? Math.PI * 0.82 : -Math.PI * 0.22
        earth.rotation.z = mirrored ? -0.05 : 0.05

        const glowShell = earth.clone(true)

        earth.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.frustumCulled = false
          }
        })

        glowShell.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry = child.geometry.clone()
            child.material = new THREE.MeshBasicMaterial({
              color: mirrored ? 0x8fb1ff : 0xa2c1ff,
              transparent: true,
              opacity: 0.18,
              side: THREE.BackSide,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            })
            child.scale.multiplyScalar(1.07)
            child.frustumCulled = false
          }
        })

        glowGroup.clear()
        modelGroup.clear()
        glowGroup.add(glowShell)
        modelGroup.add(earth)
        handleResize()
        controls.update()
      },
      undefined,
      (error) => {
        console.error('Failed to load Earth model', error)
      },
    )

    window.addEventListener('resize', handleResize)
    handleResize()
    animationFrame = window.requestAnimationFrame(tick)

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      glowGroup.clear()
      modelGroup.clear()
      composer.dispose()
      renderer.dispose()
      host.removeChild(renderer.domElement)
    }
  }, [mirrored])

  return <div ref={hostRef} className={className} aria-hidden="true" />
}

function EarthOverviewPage() {
  return (
    <main className="overview-screen">
      <div className="starfield" aria-hidden="true">
        {Array.from({ length: 280 }).map((_, index) => {
          const left = (index * 11.7 + (index % 9) * 2.9) % 100
          const top = (index * 23.9 + (index % 7) * 4.4) % 100
          const size = index % 11 === 0 ? 2.4 : index % 5 === 0 ? 1.6 : 0.9

          return (
            <span
              key={index}
              className="star"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${(index % 18) * 0.14}s`,
              }}
            />
          )
        })}
      </div>

      <EarthModel className="earth-model earth-model--left" mirrored={false} />
      <EarthModel className="earth-model earth-model--right" mirrored />

      <section className="overview-column overview-column--left">
        <article className="planet-card">
          <p className="planet-card__eyebrow">PRIMARY SIGNAL</p>
          <h2>{alphaEarthStats.title}</h2>
          {alphaEarthStats.sections.map((section) => (
            <div key={section.heading} className="planet-group">
              <h3>{section.heading}</h3>
              <dl>
                {section.rows.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </article>
      </section>

      <section className="overview-column overview-column--right">
        <article className="planet-card planet-card--right">
          <p className="planet-card__eyebrow">SECONDARY SIGNAL</p>
          <h2>{omegaEarthStats.title}</h2>
          {omegaEarthStats.sections.map((section) => (
            <div key={section.heading} className="planet-group">
              <h3>{section.heading}</h3>
              <dl>
                {section.rows.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </article>
      </section>

      <footer className="overview-bottom-bar">
        <span className="overview-bottom-bar__meta">RUNTIME: 00:00:00</span>
        <button type="button" className="overview-bottom-bar__button">
          INITIALIZE QUANTUM BRIDGE
        </button>
        <span className="overview-bottom-bar__meta overview-bottom-bar__meta--right">
          MEM: 42.7 TB&nbsp;&nbsp; TEMP: 38°C
        </span>
      </footer>
    </main>
  )
}

export default EarthOverviewPage
