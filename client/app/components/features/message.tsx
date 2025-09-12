import { forwardRef, useState } from 'react'
import { css, cva } from 'styled-system/css'
import { Avatar } from '~/components/ui/avatar'
import { IconButton } from '~/components/ui/icon-button'
import { Reply, MoreHorizontal, Smile } from 'lucide-react'

const messageStyles = cva({
  base: {
    display: 'flex',
    padding: '8px 16px',
    position: 'relative',
    transition: 'background 0.1s ease',
    _hover: {
      bg: 'bg.quaternary',
    }
  }
})

const messageAvatarStyles = cva({
  base: {
    flexShrink: 0,
    marginRight: '16px',
    marginTop: '2px',
  }
})

const messageContentStyles = cva({
  base: {
    flex: 1,
    minWidth: 0,
  }
})

const messageHeaderStyles = cva({
  base: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: '2px',
    gap: '8px',
  }
})

const messageActionsStyles = cva({
  base: {
    position: 'absolute',
    color: 'text.medium',
    top: '-8px',
    right: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    bg: 'bg.secondary',
    border: '1px solid',
    borderColor: 'border.soft',
    borderRadius: 'md',
    padding: '4px',
    opacity: 0,
    transition: 'all 0.1s ease',
    boxShadow: 'sm',
    '&[data-visible]': {
      opacity: 1,
    }
  }
})

export interface MessageData {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
    color?: string
  }
  timestamp: string
  replyTo?: {
    id: string
    author: { name: string }
    content: string
  }
}

export interface MessageProps {
  message: MessageData
  onReply?: (messageId: string) => void
  onReact?: (messageId: string, emoji: string) => void
  className?: string
}

export const Message = forwardRef<HTMLDivElement, MessageProps>((props, ref) => {
  const { message, onReply, onReact, className, ...rest } = props
  const [showActions, setShowActions] = useState(false)

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
    
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric'
    }) + ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div
      ref={ref}
      className={[messageStyles(), className].filter(Boolean).join(' ')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      {...rest}
    >
      <div className={messageAvatarStyles()}>
        <Avatar
          name={message.author.name}
          src={message.author.avatar}
          size="sm"
        />
      </div>
      
      <div className={messageContentStyles()}>
        {message.replyTo && (
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: 'xs',
            color: 'fg.muted',
            marginBottom: '4px'
          })}>
            <Reply size={14} />
            <span>Replying to {message.replyTo.author.name}</span>
          </div>
        )}
        
        <div className={messageHeaderStyles()}>
          <span 
            className={css({
              fontWeight: 'semibold',
              fontSize: 'sm',
              color: message.author.color || 'text.bright',
              cursor: 'pointer',
              _hover: { textDecoration: 'underline' }
            })}
          >
            {message.author.name}
          </span>
          <span className={css({
            fontSize: 'xs',
            color: 'fg.muted',
            fontWeight: 'medium'
          })}>
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        
        <div className={css({
          fontSize: 'md',
          lineHeight: '1.375',
          color: 'text.medium',
          wordWrap: 'break-word'
        })}>
          {message.content}
        </div>
      </div>
      
      <div 
        className={messageActionsStyles()}
        {...(showActions && { 'data-visible': '' })}
      >
        <IconButton
          variant="ghost"
          size="sm"
          onClick={() => onReact?.(message.id, '👍')}
          className={css({ color: 'text.bright', _hover: { color: 'text.bright', bgColor: 'bg.tertiary' } })}
        >
          <Smile size={16} />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          onClick={() => onReply?.(message.id)}
          className={css({ color: 'text.bright', _hover: { color: 'text.bright', bgColor: 'bg.tertiary' } })}
        >
          <Reply size={16} />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          className={css({ color: 'text.bright', _hover: { color: 'text.bright', bgColor: 'bg.tertiary' } })}
        >
          <MoreHorizontal size={16} />
        </IconButton>
      </div>
    </div>
  )
})

Message.displayName = 'Message'
