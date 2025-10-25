import { useRef } from "react";

export const useAutoScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    scrollRef.current?.scrollIntoView({ behavior });
  };

  const scrollToTop = (behavior: ScrollBehavior = "smooth") => {
    containerRef.current?.scrollTo({ top: 0, behavior });
  };

  return {
    scrollRef,
    containerRef,
    scrollToBottom,
    scrollToTop,
  };
};
