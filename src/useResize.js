import { useState, useEffect } from 'react';

export default function useResize() {
  const [size, setSize] = useState({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  });

  useEffect(() => {
    function resizeHandler() {
      setSize({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      });
    }
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  });

  return size;
}