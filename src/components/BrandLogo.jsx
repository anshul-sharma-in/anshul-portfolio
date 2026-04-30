// Reusable AS wordmark. Renders the initials in the display font with an
// orange→red gradient — no container or backplate.
// Used in Navbar (size ~28) and as a building block for the favicon.

export default function BrandLogo({ size = 28, className = '' }) {
  return (
    <span
      className={`font-display font-extrabold leading-none select-none ${className}`}
      aria-label="Anshul Sharma"
      style={{
        fontSize: size,
        letterSpacing: '-0.05em',
        backgroundImage: 'linear-gradient(135deg, #FF5800 0%, #C41E3A 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }}
    >
      AS
    </span>
  )
}
