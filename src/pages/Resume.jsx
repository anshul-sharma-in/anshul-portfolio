import PageTransition from '../components/PageTransition'

// Replace RESUME_URL with your S3 presigned URL or Amplify Storage URL
const RESUME_URL = 'https://your-s3-bucket.s3.amazonaws.com/resume/anshul-sharma-resume.pdf'

export default function Resume() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="section-title mb-0">Resume</h2>
          <a
            href={RESUME_URL}
            download="Anshul_Sharma_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <span>⬇</span> Download PDF
          </a>
        </div>

        {/* PDF Viewer */}
        <div
          className="rounded-xl overflow-hidden border border-white/10"
          style={{ height: '75vh', background: '#1a1a1a' }}
        >
          <iframe
            src={`${RESUME_URL}#toolbar=0`}
            className="w-full h-full"
            title="Anshul Sharma Resume"
          >
            <div className="flex flex-col items-center justify-center h-full text-white/40 text-center p-8">
              <p className="text-4xl mb-4">📄</p>
              <p className="font-display text-lg">Resume not loaded</p>
              <p className="text-sm mt-2">
                Upload your resume PDF to S3 and update the RESUME_URL in
                src/pages/Resume.jsx
              </p>
              <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 text-sm">
                Open PDF
              </a>
            </div>
          </iframe>
        </div>
      </div>
    </PageTransition>
  )
}
