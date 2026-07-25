import type { ImgHTMLAttributes } from 'react'
import {
  characterAssets,
  type CharacterStage,
} from '../assets/characters'

export interface CharacterSpriteProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'> {
  characterId: string
  stage: number
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
  const fallbackCharacterId = 'teoreuteu'
  const assetId = characterId in characterAssets ? characterId as keyof typeof characterAssets : fallbackCharacterId
  const assetStage = Math.min(4, Math.max(1, Math.round(stage))) as CharacterStage

  return (
    <img
      {...imageProps}
      alt={alt}
      className={['block object-contain', className].filter(Boolean).join(' ')}
      decoding="sync"
      height={size}
      loading="eager"
      src={characterAssets[assetId][assetStage]}
      style={{ width: size, height: size, ...style }}
      width={size}
    />
  )
}
