import { forwardRef, useState, createContext, useContext, type ReactNode } from 'react'
import { css, cva } from 'styled-system/css'
import { ChevronRight } from 'lucide-react'
import { Channel, type ChannelData, type ChannelProps } from './channel'

// Context for sharing state between Category components
interface CategoryContextValue {
  isExpanded: boolean
  onToggle: () => void
  selectedChannelId?: string
  onChannelSelect?: (channelId: string) => void
}

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined)

const useCategoryContext = () => {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error('Category compound components must be used within a Category')
  }
  return context
}

// Root Category component
const categoryStyles = cva({
  base: {
    margin: '16px 8px 0 8px',
  }
})

interface CategoryProps {
  children: ReactNode
  defaultExpanded?: boolean
  onChannelSelect?: (channelId: string) => void
  className?: string
}

const CategoryRoot = forwardRef<HTMLDivElement, CategoryProps>((props, ref) => {
  const { children, defaultExpanded = true, onChannelSelect, className } = props
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleToggle = () => {
    setIsExpanded(prev => !prev)
  }

  const contextValue: CategoryContextValue = {
    isExpanded,
    onToggle: handleToggle,
    onChannelSelect
  }

  return (
    <CategoryContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={[categoryStyles(), className].filter(Boolean).join(' ')}
      >
        {children}
      </div>
    </CategoryContext.Provider>
  )
})

CategoryRoot.displayName = 'Category'

// Category Title component
const titleStyles = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: 'xs',
    fontWeight: 'bold',
    color: 'text.medium',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.1s ease',
    _hover: {
      color: 'text.bright',
    }
  }
})

const chevronStyles = cva({
  base: {
    color: 'inherit',
    transition: 'transform 0.1s ease',
  },
  variants: {
    expanded: {
      true: {
        transform: 'rotate(90deg)',
      }
    }
  }
})

interface TitleProps {
  children: ReactNode
  className?: string
}

const Title = forwardRef<HTMLDivElement, TitleProps>((props, ref) => {
  const { children, className } = props
  const { isExpanded, onToggle } = useCategoryContext()

  return (
    <div 
      ref={ref}
      className={[titleStyles(), className].filter(Boolean).join(' ')}
      onClick={onToggle}
    >
      <div className={chevronStyles({ expanded: isExpanded })}>
        <ChevronRight size={14} />
      </div>
      <span>{children}</span>
    </div>
  )
})

Title.displayName = 'Category.Title'

// Category Channel wrapper
interface CategoryChannelProps extends Omit<ChannelProps, 'onSelect'> {
  children?: never // Prevent children since Channel manages its own content
}

const CategoryChannel = forwardRef<HTMLDivElement, CategoryChannelProps>((props, ref) => {
  const { channel, className, ...rest } = props
  const { isExpanded, onChannelSelect } = useCategoryContext()

  if (!isExpanded) {
    return null
  }

  return (
    <Channel
      ref={ref}
      channel={channel}
      onSelect={onChannelSelect}
      className={className}
      {...rest}
    />
  )
})

CategoryChannel.displayName = 'Category.Channel'

// Content container for custom content
const contentStyles = cva({
  base: {
    overflow: 'hidden',
    transition: 'all 0.2s ease',
  }
})

interface ContentProps {
  children: ReactNode
  className?: string
}

const Content = forwardRef<HTMLDivElement, ContentProps>((props, ref) => {
  const { children, className } = props
  const { isExpanded } = useCategoryContext()

  if (!isExpanded) {
    return null
  }

  return (
    <div
      ref={ref}
      className={[contentStyles(), className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
})

Content.displayName = 'Category.Content'

// Export the compound component
export const Category = Object.assign(CategoryRoot, {
  Title,
  Channel: CategoryChannel,
  Content,
})

export { type CategoryProps, type ChannelData }
