import PageTransition from '../components/PageTransition'
import { motion } from 'framer-motion'

const ROLES = [
  {
    title: 'Senior Software Engineer',
    company: 'Morningstar India Pvt. Ltd.',
    period: 'Oct 2025 – Present',
    color: '#FF5800',
    current: true,
    bullets: [
      'Improved application performance by optimizing UI load times to meet defined SLA targets.',
      'Replaced dynamic resource loading with strategic static imports, reducing initial render latency and improving user experience.',
      'Collaborated across frontend and backend layers to identify and eliminate performance bottlenecks.',
      'Strengthened system responsiveness through efficient resource handling and optimized data flow.',
      'Worked in a full-stack capacity using modern frameworks and backend technologies.',
    ],
    projects: [
      {
        name: 'Client Dashboard — Portfolio Aggregation System',
        tech: ['.NET Core', 'AWS ECS', 'SQS', 'AWS Glue', 'DynamoDB', 'S3', 'CloudFormation', 'CloudFront'],
        period: 'Oct 2025 – Present',
        desc: "Developed a high-performance dashboard to display aggregated data for clients' last 6 modified portfolios in near real-time. Designed a scalable batch processing solution using a .NET Core console application deployed on AWS ECS with multiple parallel tasks for high throughput. Integrated SQS for async messaging, AWS Glue for data transformation, DynamoDB for low-latency storage, S3 for retrieval, CloudFormation for infra automation, and CloudFront for content delivery. Reduced user wait time for portfolio insights through optimized backend processing.",
      },
    ],
  },
  {
    title: 'Software Engineer',
    company: 'Morningstar India Pvt. Ltd.',
    period: 'Jan 2023 – Oct 2025',
    color: '#009E60',
    current: false,
    bullets: [
      'Working on portfolio management and reporting applications, user support platforms, and advisor tools — contributing to UI development (Vue.js, Angular, JavaScript), API design and integration (.NET, Play Framework), and database operations (MySQL).',
      'Enhancing data consistency and reliability across 10K+ client portfolios through optimized data validation and synchronization strategies.',
      'Delivering multiple high-impact product enhancements used by 50K+ financial advisors, improving usability, reporting accuracy, and overall performance.',
      'Implementing and managing content models and stacks using Contentstack (Headless CMS) to deliver scalable, dynamic, and user-centric solutions.',
    ],
    projects: [
      {
        name: 'Digital Report — C++ Calculation Engine',
        tech: ['C++', '.NET', 'Vue.js'],
        period: 'Nov 2023 – Oct 2025',
        desc: 'Collaborating on updating the calculation engine (C++) to accurately compute portfolio data across the application. Building a POC for an enhanced portfolio web report with interactive charts and tables accessible outside the main application without login.',
      },
      {
        name: 'Portfolio Compare & X-Ray, NextGen',
        tech: ['Vue.js', '.NET'],
        period: 'Jan 2023 – Nov 2023',
        desc: 'Developed and enhanced X-Ray and Compare tools for portfolios — interactive graphs, dynamic portfolio management, and lazy loading for improved performance. Created .NET APIs and wrote unit tests for both frontend and backend.',
      },
    ],
  },
  {
    title: 'Associate Software Engineer',
    company: 'Morningstar India Pvt. Ltd.',
    period: 'Mar 2021 – Jan 2023',
    color: '#0045AD',
    current: false,
    bullets: [
      'Worked on the Mobile Application team for Morningstar Advisor products, handling API integration and data management using the Play Framework (Java) to enhance backend performance and reliability.',
      'Contributed to new UI development for Advisor Workstation using Vue.js, improving user experience, accessibility, and interface performance across key application modules.',
      'Defined and streamlined CI/CD processes, created detailed Wiki documentation, and established best practices for code review and deployment.',
    ],
    projects: [
      {
        name: 'Application Help & Support — Mobile App',
        tech: ['Java', 'Vue.js', 'Contentstack'],
        period: 'Mar 2021 – Jan 2023',
        desc: 'Enhanced API performance for mobile and web applications. Designed and implemented content models in Contentstack (Headless CMS) for the Help & Support application. Implemented responsive UI components from Figma designs with accessibility and clean CSS styling.',
      },
    ],
  },
]

export default function Experience() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="section-title">Experience</h2>

        <div className="relative">
          <div
            className="absolute left-0 top-2 bottom-2 w-px hidden md:block"
            style={{ background: 'linear-gradient(to bottom, #FF5800, #0045AD, #009E60)' }}
          />

          <div className="space-y-12">
            {ROLES.map((role, ri) => (
              <motion.div
                key={role.title + role.period}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ri * 0.15 }}
                className="md:pl-10 relative"
              >
                <div
                  className="absolute left-0 top-1.5 w-2 h-2 rounded-full hidden md:block -translate-x-[3px]"
                  style={{ backgroundColor: role.color, boxShadow: `0 0 8px ${role.color}` }}
                />

                <div className="glass-card" style={{ borderLeft: `3px solid ${role.color}` }}>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-display font-bold text-lg" style={{ color: role.color }}>
                        {role.title}
                      </h3>
                      <p className="text-white/70 text-sm font-body">{role.company}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {role.current && (
                        <span
                          className="px-2 py-0.5 text-xs rounded-full font-body font-semibold"
                          style={{ background: `${role.color}22`, color: role.color, border: `1px solid ${role.color}55` }}
                        >
                          Current
                        </span>
                      )}
                      <span className="text-white/40 text-xs font-body">{role.period}</span>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {role.bullets.map((b, bi) => (
                      <li key={bi} className="flex gap-2 text-sm text-white/65 font-body leading-relaxed">
                        <span style={{ color: role.color }} className="mt-1 flex-shrink-0">▸</span>
                        {b}
                      </li>
                    ))}
                  </ul>

                  {role.projects.length > 0 && (
                    <div className="mt-6">
                      <p className="text-white/40 text-xs font-display uppercase tracking-widest mb-3">Key Projects</p>
                      <div className="space-y-3">
                        {role.projects.map((proj, pi) => (
                          <div
                            key={pi}
                            className="rounded-lg p-4"
                            style={{ background: `${role.color}0d`, border: `1px solid ${role.color}33` }}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <span className="font-display font-semibold text-sm text-white/90">{proj.name}</span>
                              <span className="text-white/35 text-xs font-body">{proj.period}</span>
                            </div>
                            <p className="text-white/55 text-xs font-body leading-relaxed mb-2">{proj.desc}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {proj.tech.map((t) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 text-xs rounded font-body text-white/60"
                                  style={{ background: `${role.color}18`, border: `1px solid ${role.color}44` }}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}