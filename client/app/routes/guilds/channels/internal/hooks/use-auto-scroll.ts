import { useEffect, useRef } from "react";

export const useAutoScroll = <T>(dependencies: T[]) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    scrollRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, dependencies);

  return {
    scrollRef,
    containerRef,
    scrollToBottom,
  };
};
