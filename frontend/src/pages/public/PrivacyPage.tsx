import { Link } from 'react-router-dom';
import { ArrowLeft, Coffee } from 'lucide-react';

export function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#faf8f4] text-gray-900">
      <header className="border-b border-amber-950/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3" aria-label="CaféCore home">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-900 text-amber-50">
              <Coffee className="h-5 w-5" />
            </span>
            <span className="font-bold text-amber-950">CaféCore</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-900 hover:text-amber-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
          CaféCore customer information
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-amber-950 sm:text-4xl">
          Privacy notice
        </h1>
        <p className="mt-4 text-sm leading-6 text-gray-600">
          This notice explains what information the CaféCore pickup-order experience asks for and
          how it is used to prepare and manage your order.
        </p>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">Information you provide</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              When placing a pickup order, we ask for your name and phone number along with the
              items you select. These details are attached to the order so café staff can identify
              and prepare it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">How the information is used</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Café staff can see your contact details with the order in order to prepare and hand
              over your pickup. Order information is also retained in the café&apos;s management
              system for order history and operational records.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Public pickup orders are paid for at the café. This page does not collect card
              details or process online payments.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">Questions about an order</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              For questions about an order or the information associated with it, please contact
              the café staff directly.
            </p>
          </section>
        </div>

        <p className="mt-12 border-t border-amber-950/10 pt-5 text-xs leading-5 text-gray-500">
          This notice describes the information used by this application&apos;s current pickup-order
          flow. The café should review and adapt it to its actual privacy practices and applicable
          legal requirements.
        </p>
      </article>
    </main>
  );
}
