import { Brain, Mail, ShieldCheck } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-[#172033] text-white">

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4c430] text-[#172033]">
                <Brain size={23} />
              </div>

              <div>
                <h2 className="text-xl font-black">
                  STATWISE <span className="text-[#f4c430]">AI</span>
                </h2>

                <p className="text-[10px] uppercase tracking-widest text-gray-400">
                  Skill Intelligence
                </p>
              </div>

            </div>

            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-300">
              AI-powered skill intelligence and personalized learning
              for a continuously improving workforce.
            </p>

          </div>


          {/* Platform */}
          <div>

            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-[#f4c430]">
              Platform
            </h3>

            <div className="space-y-3 text-sm text-gray-300">

              <a href="/" className="block hover:text-white">
                Home
              </a>

              <a href="/dashboard" className="block hover:text-white">
                Dashboard
              </a>

              <a href="/skills" className="block hover:text-white">
                Skill Intelligence
              </a>

              <a href="/learning" className="block hover:text-white">
                Learning
              </a>

            </div>

          </div>


          {/* Learning */}
          <div>

            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-[#f4c430]">
              Learning
            </h3>

            <div className="space-y-3 text-sm text-gray-300">

              <a href="/assessments" className="block hover:text-white">
                Assessments
              </a>

              <a href="/tutor" className="block hover:text-white">
                AI Tutor
              </a>

              <a href="/courses" className="block hover:text-white">
                Courses
              </a>

              <a href="/progress" className="block hover:text-white">
                Progress Tracking
              </a>

            </div>

          </div>


          {/* Contact */}
          <div>

            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-[#f4c430]">
              Contact
            </h3>

            <div className="space-y-4">

              <div className="flex items-start gap-3">

                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-[#f4c430]"
                />

                <div>

                  <p className="text-xs text-gray-400">
                    Email
                  </p>

                  <p className="mt-1 text-sm">
                    support@statwise.ai
                  </p>

                </div>

              </div>


              <div className="flex items-start gap-3">

                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-[#f4c430]"
                />

                <div>

                  <p className="text-xs text-gray-400">
                    Platform
                  </p>

                  <p className="mt-1 text-sm">
                    Secure AI Learning
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* Bottom */}
      <div className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-gray-400 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">

          <p>
            © 2026 STATWISE AI. All rights reserved.
          </p>

          <div className="flex gap-5">

            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>

            <a href="#" className="hover:text-white">
              Terms of Use
            </a>

            <a href="#" className="hover:text-white">
              Accessibility
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;