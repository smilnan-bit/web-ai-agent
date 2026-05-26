import { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

const useResize = (dynamic: boolean) => {
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
    first: true,
  });
  useEffect(() => {
    const debouncedHandleResize = debounce(() => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
        first: false,
      });
    }, 200);

    dynamic && window.addEventListener('resize', debouncedHandleResize);

    return () => {
      dynamic && window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [dynamic]);
  return dimensions;
};

export default useResize;
