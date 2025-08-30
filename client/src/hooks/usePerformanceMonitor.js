import { useEffect, useRef } from 'react';

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const startTime = useRef(performance.now());
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const mountTime = performance.now() - startTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} mounted in ${mountTime.toFixed(2)}ms`);
      }
    }

    return () => {
      if (process.env.NODE_ENV === 'development') {
        const unmountTime = performance.now() - startTime.current;
        console.log(`${componentName} unmounted after ${unmountTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const logMemory = () => {
        const memory = performance.memory;
        console.log({
          usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
          totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
          jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
        });
      };

      const interval = setInterval(logMemory, 30000); // Log every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, []);
};

// Re-render monitoring
export const useRenderMonitor = (componentName, deps = []) => {
  const renderCount = useRef(0);
  const prevDeps = useRef(deps);

  useEffect(() => {
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times`);
      
      // Check which dependency changed
      if (prevDeps.current.length !== deps.length) {
        console.log(`${componentName}: dependency array length changed`);
      } else {
        deps.forEach((dep, index) => {
          if (dep !== prevDeps.current[index]) {
            console.log(`${componentName}: dependency ${index} changed`, {
              from: prevDeps.current[index],
              to: dep,
            });
          }
        });
      }
    }
    
    prevDeps.current = deps;
  });
};
