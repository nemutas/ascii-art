export function calcCoveredScale(textureAspect: number, screenAspect: number, target?: THREE.Vector2) {
  let result: [number, number] = [1, 1]
  if (screenAspect < textureAspect) result = [screenAspect / textureAspect, 1]
  else result = [1, textureAspect / screenAspect]

  target?.set(result[0], result[1])

  return result
}

export function calcCoveredTextureScale(texture: THREE.Texture, aspect: number, target?: THREE.Vector2) {
  const imageAspect = texture.image.width / texture.image.height
  return calcCoveredScale(imageAspect, aspect, target)
}

export function coveredTexture(texture: THREE.Texture, screenAspect: number) {
  texture.matrixAutoUpdate = false
  const scale = calcCoveredTextureScale(texture, screenAspect)
  texture.matrix.setUvTransform(0, 0, scale[0], scale[1], 0, 0.5, 0.5)

  return texture
}
