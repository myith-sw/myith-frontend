import type { ImgHTMLAttributes } from 'react'
import {
  characterAssets,
  type CharacterId,
  type CharacterStage,
} from '../assets/characters'

export interface CharacterSpriteProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'> {
  characterId: CharacterId
  stage: CharacterStage
  size?: number
  alt?: string
}

export function CharacterSprite({
  characterId,
  stage,
  size = 75,
  alt = `${characterId} stage ${stage}`,
  className,
  style,
  ...imageProps
}: CharacterSpriteProps) {
  return (
    <img
      {...imageProps}
      alt={alt}
      className={['block object-contain', className].filter(Boolean).join(' ')}
      decoding="sync"
      height={size}
      loading="eager"
      src={characterAssets[characterId][stage]}
      style={{ width: size, height: size, ...style }}
      width={size}
    />
  )
}
