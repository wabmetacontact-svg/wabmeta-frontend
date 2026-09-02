import React from 'react';

const LAST_UPDATED = '2 September 2026';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p>
              WabMeta is a WhatsApp Business messaging platform for businesses. This policy explains
              what personal data we collect, why we collect it, who we share it with and how you can
              control it. It covers both the WabMeta website and the WabMeta mobile application for
              Android and iOS.
            </p>
            <p className="mt-3">
              WabMeta is a business tool and is not intended for anyone under 18. We do not
              knowingly collect data from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Data We Collect</h2>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>
                <span className="font-medium">Account information</span> &mdash; your name, email
                address, phone number, password (stored hashed) and profile photo.
              </li>
              <li>
                <span className="font-medium">Organisation and billing information</span> &mdash;
                your business name, plan, wallet balance and invoice history.
              </li>
              <li>
                <span className="font-medium">WhatsApp Business Account information</span> &mdash;
                your business profile, registered phone numbers, message templates and the access
                tokens that let us send on your behalf.
              </li>
              <li>
                <span className="font-medium">Contacts</span> &mdash; the customer contacts you add,
                import from a file, or import from your phone's address book.
              </li>
              <li>
                <span className="font-medium">Messages and media</span> &mdash; the conversations
                exchanged between your business and your customers, including images, video,
                documents and voice messages.
              </li>
              <li>
                <span className="font-medium">Usage data</span> &mdash; the delivery, read and
                failure statistics we generate so you can see how your campaigns performed.
              </li>
              <li>
                <span className="font-medium">Device information</span> &mdash; a push notification
                token and basic device details, used only to deliver notifications to you.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. The WabMeta Mobile Application</h2>
            <p>
              The mobile app asks for the following device permissions. Each one is optional, is
              requested only when you use the feature that needs it, and can be revoked at any time
              in your device settings.
            </p>
            <ul className="list-disc ml-6 mt-3 space-y-2">
              <li>
                <span className="font-medium">Contacts</span> &mdash; when you choose to import
                contacts from your phone, we read the names, phone numbers and email addresses in
                your address book so you can pick which ones to add. Only the contacts you select
                are uploaded to your WabMeta workspace and stored on our servers. We never upload
                your address book automatically, and we do not modify or delete anything in it.
              </li>
              <li>
                <span className="font-medium">Camera</span> &mdash; to take a photo or video to send
                in a conversation.
              </li>
              <li>
                <span className="font-medium">Photos, media and files</span> &mdash; to attach an
                existing image, video or document to a conversation or a message template.
              </li>
              <li>
                <span className="font-medium">Microphone</span> &mdash; to record a voice message
                when you press and hold the record button in a chat.
              </li>
              <li>
                <span className="font-medium">Notifications</span> &mdash; to alert you about new
                customer messages and campaign results.
              </li>
            </ul>
            <p className="mt-3">
              Media you capture or attach is uploaded to our servers so it can be delivered through
              WhatsApp. The app does not track your location, and it contains no advertising or
              third-party analytics software.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. How We Use Your Data</h2>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>To provide and maintain the WabMeta messaging service</li>
              <li>To send messages on your behalf to the customers you choose</li>
              <li>To show you delivery, engagement and campaign reporting</li>
              <li>To process payments and maintain your wallet and invoices</li>
              <li>To provide customer support when you contact us</li>
              <li>To detect abuse and keep the platform secure</li>
              <li>To meet our legal and tax obligations</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal data, and we do not use your contacts or the contents of
              your conversations for advertising or to train machine learning models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Who We Share Data With</h2>
            <p>We share data only with the service providers needed to run WabMeta:</p>
            <ul className="list-disc ml-6 mt-3 space-y-2">
              <li>
                <span className="font-medium">Meta Platforms (WhatsApp Business Platform)</span>
                &mdash; message content and recipient phone numbers, so your messages can be
                delivered. Meta processes this under its own terms and privacy policy.
              </li>
              <li>
                <span className="font-medium">Razorpay</span> &mdash; handles payments and wallet
                top-ups. Card and banking details are entered directly with Razorpay; WabMeta never
                receives or stores them.
              </li>
              <li>
                <span className="font-medium">Cloud hosting and storage providers</span> &mdash; our
                servers, database and media storage, which hold data on our behalf under
                confidentiality obligations.
              </li>
              <li>
                <span className="font-medium">Google Analytics</span> &mdash; used on the WabMeta
                website only, for aggregate traffic statistics. It is not present in the mobile app.
              </li>
            </ul>
            <p className="mt-3">
              We may also disclose data where the law requires it, or to protect our rights and the
              safety of our users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. How Long We Keep It</h2>
            <p>
              We keep your data for as long as your account is active. When you delete your account,
              your profile, contacts, conversations, media, campaigns and WhatsApp connection are
              erased immediately. Where the law requires it, we retain a minimal record of financial
              transactions to meet tax and accounting obligations; these contain no contacts,
              messages or campaign content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Security</h2>
            <p>
              All traffic between our apps and our servers is encrypted with HTTPS. Passwords are
              stored hashed and are never readable by us. On mobile, authentication tokens are held
              in the device's encrypted secure storage. We apply appropriate technical and
              organisational measures to protect your data against unauthorised access, alteration,
              disclosure or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Export your data</li>
              <li>Object to or restrict how we process your data</li>
              <li>Withdraw a device permission at any time in your device settings</li>
              <li>
                Delete your account and all associated data &mdash; see{' '}
                <a href="/data-deletion" className="text-blue-600 hover:underline">
                  our account deletion page
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Your Responsibilities</h2>
            <p>
              When you upload contacts and message customers through WabMeta, you are the
              controller of that data and we process it on your behalf. You are responsible for
              having a lawful basis to contact those people, for honouring their opt-outs, and for
              complying with WhatsApp's Business Messaging Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
            <p>
              If we make material changes to this policy we will update the date at the top of this
              page and, where the change is significant, notify you in the app or by email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
            <p>
              For any privacy question or request, contact us at{' '}
              <a href="mailto:privacy@wabmeta.com" className="text-blue-600 hover:underline">
                privacy@wabmeta.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
