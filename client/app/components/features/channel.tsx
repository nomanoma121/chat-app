import { forwardRef } from 'react'
import { css, cva } from 'styled-system/css'
import { Hash } from 'lucide-react'

const channelStyles = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    margin: '1px 8px',
    borderRadius: 'md',
    cursor: 'pointer',
    fontSize: 'md',
    fontWeight: 'medium',
    color: 'fg.muted',
    transition: 'all 0.1s ease',
    position: 'relative',
    _hover: {
      bg: 'bg.quaternary',
      color: 'fg.default',
    }
  },
  variants: {
    selected: {
      true: {
        bg: 'bg.quaternary',
        color: 'fg.default',
      }
    },
    unread: {
      true: {
        color: 'fg.default',
        _after: {
          content: '""',
          position: 'absolute',
          left: '0',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '4px',
          height: '8px',
          bg: 'fg.default',
          borderRadius: 'full',
        }
      }
    },
    mentioned: {
      true: {
        color: 'fg.default',
        _after: {
          content: '""',
          position: 'absolute',
          left: '0',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '4px',
          height: '8px',
          bg: 'accent.normal',
          borderRadius: 'full',
        }
      }
    }
  }
})

export interface ChannelData {
  id: string
  name: string
  unreadCount?: number
  mentionCount?: number
  isSelected?: boolean
}

export interface ChannelProps {
  channel: ChannelData
  onSelect?: (channelId: string) => void
  className?: string
}

export const Channel = forwardRef<HTMLDivElement, ChannelProps>((props, ref) => {
  const { channel, onSelect, className } = props
  
  const hasUnread = Boolean(channel.unreadCount && channel.unreadCount > 0)
  const hasMention = Boolean(channel.mentionCount && channel.mentionCount > 0)

  return (
    <div
      ref={ref}
      className={[
        channelStyles({ 
          selected: channel.isSelected,
          unread: hasUnread && !hasMention,
          mentioned: hasMention
        }),
        className
      ].filter(Boolean).join(' ')}
      onClick={() => onSelect?.(channel.id)}
    >
      <div className={css({ flexShrink: 0, color: 'inherit' })}>
        <Hash size={20} />
      </div>
      
      <span className={css({
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      })}>
        {channel.name}
      </span>
      
      {hasMention && (
        <div className={css({
          minWidth: '16px',
          height: '16px',
          borderRadius: 'full',
          fontSize: 'xs',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px',
          bg: 'accent.normal',
          color: 'white'
        })}>
          {(channel.mentionCount ?? 0) > 99 ? '99+' : channel.mentionCount}
        </div>
      )}
      
      {!hasMention && hasUnread && (
        <div className={css({
          minWidth: '16px',
          height: '16px',
          borderRadius: 'full',
          bg: 'fg.muted',
        })} />
      )}
    </div>
  )
})

Channel.displayName = 'Channel'