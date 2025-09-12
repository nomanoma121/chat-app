import { forwardRef, useState } from 'react'
import { css } from "styled-system/css"

export interface GuildIconProps {
  src?: string
  alt?: string
  size?: number
  name?: string
  className?: string
}

export const GuildIcon = forwardRef<HTMLDivElement, GuildIconProps>((props, ref) => {
  const { src, alt, size = 48, name, className, ...rest } = props
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const getInitials = (guildName?: string) => {
    if (!guildName) return '?'
    return guildName
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div
      ref={ref}
      className={[css({
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
        bg: "bg.muted",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        _hover: {
          borderRadius: "2xl",
        }
      }), className].filter(Boolean).join(' ')}
      {...rest}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || `Guild icon`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={css({
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.2s ease"
          })}
        />
      ) : (
        <span
          className={css({
            fontSize: `${size * 0.4}px`,
            fontWeight: "semibold",
            color: "fg.muted",
            userSelect: "none"
          })}
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  )
})

GuildIcon.displayName = 'GuildIcon'
