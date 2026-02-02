import type { Profile } from '../types';

type ContactFloatingProps = {
  profile: Profile;
};

export default function ContactFloating({ profile }: ContactFloatingProps) {
  const contact = profile.contact;
  const hasPhone = contact?.phone?.trim();
  const hasEmail = contact?.email?.trim();
  const hasLinkedIn = contact?.linkedIn?.trim();
  const hasAny = hasPhone || hasEmail || hasLinkedIn;

  if (!hasAny) return null;

  const phoneDisplay = hasPhone ? contact!.phone!.trim() : '';
  const emailDisplay = hasEmail ? contact!.email!.trim() : '';
  const telHref = hasPhone ? `tel:${contact!.phone!.trim().replace(/\s/g, '')}` : undefined;
  const mailHref = hasEmail ? `mailto:${contact!.email!.trim()}` : undefined;
  const linkedInHref = hasLinkedIn ? contact!.linkedIn!.trim() : undefined;

  return (
    <div
      className="group fixed bottom-0 right-4 z-30 w-[min(100vw-2rem,300px)] flex flex-col-reverse overflow-hidden"
      aria-label="Contact"
    >
      {/* Pestaña: visible solo cuando el panel está cerrado; al hacer hover se oculta y se muestra solo el panel */}
      <div className="flex-shrink-0 max-h-20 overflow-hidden transition-all duration-300 ease-out group-hover:max-h-0 group-hover:opacity-0 px-4 py-2.5 rounded-t-lg bg-gradient-to-r from-cyan-500/25 to-teal-500/25 border border-b-0 border-cyan-400/30 shadow-md cursor-default">
        <span className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">Contact me</span>
      </div>
      {/* Panel que se desliza: arriba "Contact me", abajo los datos */}
      <div className="translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 flex flex-col rounded-t-xl bg-white/95 backdrop-blur border border-b-0 border-slate-200/80 shadow-xl overflow-hidden">
        {/* Arriba: título Contact me */}
        <div className="flex-shrink-0 px-4 py-2.5 rounded-t-xl bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border-b border-slate-200/60">
          <span className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">Contact me</span>
        </div>
        {/* Abajo: teléfono, email, LinkedIn */}
        <div className="px-3 py-3 space-y-2 text-sm">
          {hasPhone && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={telHref} className="text-slate-800 hover:text-cyan-700 underline underline-offset-2 break-all">
                {phoneDisplay}
              </a>
            </div>
          )}
          {hasEmail && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={mailHref} className="text-slate-800 hover:text-cyan-700 underline underline-offset-2 break-all">
                {emailDisplay}
              </a>
            </div>
          )}
          {hasLinkedIn && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0 text-cyan-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <a
                href={linkedInHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-800 hover:text-cyan-700 underline underline-offset-2 break-all"
              >
                LinkedIn profile
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
