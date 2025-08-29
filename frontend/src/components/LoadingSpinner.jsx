const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]} ${className}`}></div>
  )
}

export default LoadingSpinner
