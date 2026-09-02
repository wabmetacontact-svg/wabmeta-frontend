import React from 'react';

const LAST_UPDATED = '2 September 2026';

const DataDeletion: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delete Your WabMeta Account</h1>
        <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="space-y-8 text-gray-700">
          <section>
            <p>
              You can delete your WabMeta account and all of its data at any time. Deletion is
              immediate and permanent &mdash; we do not keep a copy and it cannot be undone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Option 1: In the WabMeta mobile app
            </h2>
            <ol className="list-decimal ml-6 space-y-2">
              <li>Open the WabMeta app and sign in</li>
              <li>
                Go to <span className="font-medium">Settings &rarr; Profile Information</span>
              </li>
              <li>
                Scroll to <span className="font-medium">Danger Zone</span> and tap{' '}
                <span className="font-medium">Delete Account</span>
              </li>
              <li>Enter your password to confirm</li>
            </ol>
            <p className="mt-3 text-sm text-gray-500">
              Your account is erased straight away and you are signed out on every device.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Option 2: Email us</h2>
            <p>
              If you cannot access the app, send an email to{' '}
              <a
                href="mailto:privacy@wabmeta.com?subject=Data%20Deletion%20Request"
                className="text-blue-600 hover:underline font-semibold"
              >
                privacy@wabmeta.com
              </a>{' '}
              from the address your account is registered under, with the subject &ldquo;Data
              Deletion Request&rdquo;.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              We verify the request and complete the deletion within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">What gets deleted</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>Your account, profile details and login credentials</li>
              <li>Every organisation you own, and everything inside it</li>
              <li>All contacts, including any imported from your phone</li>
              <li>All conversations, messages and media</li>
              <li>Campaigns, templates, chatbots and automation flows</li>
              <li>Your WhatsApp Business Account connection and its access tokens</li>
              <li>Wallet records and billing history</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Before you delete</h2>
            <p>
              If you own an organisation that still has other team members, you will be asked to
              transfer ownership to someone else first. This protects your teammates from losing
              their access and data along with your account. Once ownership is transferred, or the
              other members are removed, deletion goes through.
            </p>
            <p className="mt-3">
              Deleting your WabMeta account does not delete your WhatsApp Business Account itself
              &mdash; that belongs to you and continues to exist in Meta Business Manager. We only
              remove our connection to it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">What we keep</h2>
            <p>
              Where the law requires it, we retain a minimal record of financial transactions
              (invoice amounts and dates) to meet tax and accounting obligations. These records
              contain no contacts, messages or campaign content. Everything else is removed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Questions</h2>
            <p>
              Write to{' '}
              <a href="mailto:privacy@wabmeta.com" className="text-blue-600 hover:underline">
                privacy@wabmeta.com
              </a>{' '}
              and we will help.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DataDeletion;
