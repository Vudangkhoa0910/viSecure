// Performance monitoring utility
class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Mark start of an operation
  markStart(operation: string): void {
    this.metrics.set(`${operation}_start`, performance.now())
  }

  // Mark end and log duration
  markEnd(operation: string): number {
    const startTime = this.metrics.get(`${operation}_start`)
    if (!startTime) {
      console.warn(`No start time found for operation: ${operation}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.metrics.set(`${operation}_duration`, duration)
    
    if (duration > 100) { // Log slow operations
      console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  // Get all metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  // Monitor navigation performance
  monitorNavigation(): void {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          
          console.log('🚀 Navigation Performance:', {
            'DOM Content Loaded': `${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`,
            'Load Complete': `${navigation.loadEventEnd - navigation.loadEventStart}ms`,
            'First Paint': this.getFirstPaint(),
            'Largest Contentful Paint': this.getLCP()
          })
        }, 0)
      })
    }
  }

  private getFirstPaint(): string {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint ? `${firstPaint.startTime.toFixed(2)}ms` : 'N/A'
  }

  private getLCP(): string {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log(`LCP: ${lastEntry.startTime.toFixed(2)}ms`)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      return 'Measuring...'
    } catch {
      return 'Not supported'
    }
  }

  // Monitor memory usage
  monitorMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      console.log('💾 Memory Usage:', {
        'Used JS Heap': `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        'Total JS Heap': `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        'Heap Limit': `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      })
    }
  }

  // Monitor long tasks
  monitorLongTasks(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`)
        })
      })
      observer.observe({ entryTypes: ['longtask'] })
    } catch {
      console.log('Long task monitoring not supported')
    }
  }

  // Initialize all monitoring
  init(): void {
    this.monitorNavigation()
    this.monitorLongTasks()
    
    // Monitor memory every 30 seconds in development
    if (window.location.hostname === 'localhost') {
      setInterval(() => this.monitorMemory(), 30000)
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()
