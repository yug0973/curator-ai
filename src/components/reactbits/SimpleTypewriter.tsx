import React, { useState, useEffect, useRef } from 'react';

interface SimpleTypewriterProps {
  text: string;
  typingSpeed?: number;
  initialDelay?: number;
  showCursor?: boolean;
  cursorColor?: string;
  textColor?: string;
  className?: string;
  onComplete?: () => void;
}

export const SimpleTypewriter: React.FC<SimpleTypewriterProps> = ({
  text,
  typingSpeed = 75,
  initialDelay = 0,
  showCursor = true,
  cursorColor = 'currentColor',
  textColor = 'inherit',
  className = '',
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (displayedText.length === text.length) {
      setIsTypingComplete(true);
      onComplete?.();
      return;
    }

    const startTyping = () => {
      timeoutRef.current = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, displayedText.length === 0 ? initialDelay : typingSpeed);
    };

    startTyping();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayedText, text, typingSpeed, initialDelay, onComplete]);

  return (
    <span className={className} style={{ color: textColor }}>
      <span>{displayedText}</span>
      {showCursor && (
        <span
          className="inline-block ml-1 animate-cursor-blink"
          style={{ color: cursorColor }}
        >
          |
        </span>
      )}
    </span>
  );
};
