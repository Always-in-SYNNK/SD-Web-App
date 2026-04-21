/**
 * AuthLayout
 * Two-column shell used by all auth pages.
 * Left slot: hero panel  |  Right slot: form panel
 */
export default function AuthLayout({ heroPanel, formPanel }) {
  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {heroPanel}
      {formPanel}
    </main>
  );
}
