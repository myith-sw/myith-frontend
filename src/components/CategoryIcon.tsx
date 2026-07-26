interface CategoryIconProps {
  active: boolean
  src: string
}

export function CategoryIcon({ active, src }: CategoryIconProps) {
  return (
    <span
      aria-hidden="true"
      className="size-3 shrink-0"
      style={{
        backgroundColor: active ? '#ffffff' : '#717171',
        maskImage: `url("${src}")`,
        maskPosition: 'center',
        maskRepeat: 'no-repeat',
        maskSize: 'contain',
        WebkitMaskImage: `url("${src}")`,
        WebkitMaskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
      }}
    />
  )
}
