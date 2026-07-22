import { homeAssets } from '../assets/home'
import type { CSSProperties } from 'react'

export type EggId = 'teoreuteu' | 'migeo' | 'soongeo'

export interface EggOption {
  id: EggId
  asset: string
  alt: string
  spriteFrameStyle: CSSProperties
  spriteImageStyle: CSSProperties
}

export interface SidebarCharacter {
  title: string
  role: string
  level: number
}

export const eggOptions: EggOption[] = [
  {
    id: 'teoreuteu',
    asset: homeAssets.eggTeoreuteuSprite,
    alt: '터르트 egg',
    spriteFrameStyle: {
      width: 70.707,
      height: 89.562,
      left: 'calc(50% + 1.18px)',
      top: 'calc(50% - 1.18px)',
    },
    spriteImageStyle: {
      width: '512%',
      height: '269.47%',
      left: '-10%',
      top: '-92.11%',
    },
  },
  {
    id: 'migeo',
    asset: homeAssets.eggMigeoSprite,
    alt: '미거 egg',
    spriteFrameStyle: {
      width: 89.562,
      height: 101.347,
      left: 'calc(50% + 1.18px)',
      top: '50%',
    },
    spriteImageStyle: {
      width: '440%',
      height: '218.84%',
      left: '-7.89%',
      top: '-65.12%',
    },
  },
  {
    id: 'soongeo',
    asset: homeAssets.eggSoongeoSprite,
    alt: '소옹어 egg',
    spriteFrameStyle: {
      width: 65.993,
      height: 75.421,
      left: 'calc(50% + 1.18px)',
      top: 'calc(50% - 1.18px)',
    },
    spriteImageStyle: {
      width: '517.14%',
      height: '339.38%',
      left: '-14.29%',
      top: '-125%',
    },
  },
]

export const sidebarCharacters: SidebarCharacter[] = [
  {
    title: '견습 서버 개발자',
    role: '백엔드 개발자',
    level: 4,
  },
  {
    title: '데이터 분석가',
    role: '데이터 분석가',
    level: 1,
  },
  {
    title: 'ㅇㅇㅇ',
    role: '디지털 마케터',
    level: 3,
  },
]
