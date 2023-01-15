import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import { resolvePath } from '../scripts/utils'
import { gl } from './core/WebGL'
import fragmentShader from './shaders/planeFrag.glsl'
import vertexShader from './shaders/planeVert.glsl'
import { Assets, loadAssets } from './utils/assetLoader'
import { calcCoveredTextureScale } from './utils/coveredTexture'

export class TCanvas {
  private assets: Assets = {
    asciiMap: { path: resolvePath('resources/ascii.png') },
    image: { path: resolvePath('resources/wlop2.jpg') },
  }

  constructor(private parentNode: ParentNode) {
    loadAssets(this.assets).then(() => {
      this.init()
      this.createObjects()
      gl.requestAnimationFrame(this.anime)
    })
  }

  private init() {
    gl.setup(this.parentNode.querySelector('.three-container')!)
    gl.scene.background = new THREE.Color('#000')
    gl.camera.position.z = 1
  }

  private createObjects() {
    const cells = { width: 80, height: 80 }
    const cellSize = { x: 1 / cells.width, y: 1 / cells.height }

    const asciiMap = this.assets.asciiMap.data as THREE.Texture
    asciiMap.wrapS = THREE.MirroredRepeatWrapping
    asciiMap.wrapT = THREE.MirroredRepeatWrapping

    const image = this.assets.image.data as THREE.Texture

    const geometry = new THREE.PlaneGeometry()
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tAsciiMap: { value: asciiMap },
        uAsciiMapSize: { value: 71 },
        tImage: { value: image },
        uCoveredScale: { value: calcCoveredTextureScale(image, 1) },
        uCellSize: { value: [cellSize.x, cellSize.y] },
        uTime: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
    })

    const instancedMesh = new THREE.InstancedMesh(geometry, material, cells.width * cells.height)

    const g = new THREE.IcosahedronGeometry(0.7, 16)
    const m = new THREE.MeshBasicMaterial()
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(g, m))
    sampler.build()
    // const targetPosition = new THREE.Vector3()

    const dummy = new THREE.Object3D()
    const offset = { x: -(1 - cellSize.x) / 2, y: -(1 - cellSize.y) / 2 }
    const uvs: number[] = []
    let i = 0
    for (let x = 0; x < cells.width; x++) {
      for (let y = 0; y < cells.height; y++) {
        // sampler.sample(targetPosition)

        dummy.scale.set(cellSize.x, cellSize.y, 1)
        dummy.position.set(x / cells.width + offset.x, y / cells.height + offset.y, 0)
        dummy.updateMatrix()
        instancedMesh.setMatrixAt(i++, dummy.matrix)

        uvs.push(x / cells.width, y / cells.height)
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true

    geometry.setAttribute('aUv', new THREE.InstancedBufferAttribute(Float32Array.from(uvs), 2))

    instancedMesh.name = 'screen'

    gl.scene.add(instancedMesh)
  }

  private get uniforms() {
    return gl.getMesh<THREE.ShaderMaterial>('screen').material.uniforms
  }

  // ----------------------------------
  // animation
  private counter = 0

  private anime = () => {
    const dt = gl.time.getDelta()

    if (this.counter % 10 === 0) {
      this.counter = 0
      this.uniforms.uTime.value += dt
    }
    this.counter++

    gl.render()
  }

  // ----------------------------------
  // dispose
  dispose() {
    gl.dispose()
  }
}
