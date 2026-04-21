import PageTransition from '../components/PageTransition'

export default function About() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="section-title">About Me</h2>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div
              className="w-48 h-48 rounded-2xl flex items-center justify-center text-5xl font-bold text-gray-300 dark:text-white/30 font-display"
              style={{
                background: 'var(--avatar-bg)',
                border: '3px solid #FF5800',
                boxShadow: '0 0 40px rgba(255,88,0,0.3)',
              }}
            >
              AS
            </div>
            <p className="mt-3 text-center text-gray-400 dark:text-white/40 text-xs"></p>
          </div>

          {/* Bio */}
          <div className="flex-1 space-y-5 text-gray-700 dark:text-white/80 leading-relaxed font-body text-base">
            <p>
              Hey there! I'm <span className="text-[#FF5800] font-semibold">Anshul Sharma</span> — a Senior Software Engineer
              with a passion for building clean, scalable, and impactful systems. I currently work on
              full-stack and cloud-heavy applications with Vue, JavaScript, .NET, and AWS.
            </p>
            <p>
              When I'm not writing code, I'm solving Rubik's cubes — a hobby that taught me patience,
              pattern recognition, and systematic thinking. I believe the same principles that solve a
              3×3 cube apply to solving complex software problems.
            </p>
            <p>
              I'm also deeply passionate about knowledge sharing. I conduct mock interviews for aspiring
              developers to help them crack their dream job, sharing curated Q&A, guidance, and honest
              feedback.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: 'Years Experience', value: '5+' },
                { label: 'Projects Built', value: '10+' },
                { label: 'Cubes Solved 🧩', value: '∞' },
              ].map((s) => (
                <div key={s.label} className="glass-card text-center">
                  <div className="text-3xl font-black font-display" style={{ color: '#FF5800' }}>
                    {s.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-white/50 mt-1 font-body">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-6 flex-wrap">
              <a
                href="https://www.linkedin.com/in/anshul-sharma-in/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                LinkedIn Profile
              </a>
              <a
                href="https://github.com/anshul-sharma-in"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-sm"
              >
                GitHub Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
