import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { fetchJson } from '../api/client';

export default function SecurityPage() {
  const action = new URLSearchParams(location.search).get('action') || 'request';
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <main className="rv-container py-16 max-w-lg">
      <h1 className="heading-2">
        {action === 'request'
          ? 'A fresh start.'
          : action === 'verify'
          ? 'Make it official.'
          : 'Your account, secured.'}
      </h1>
      <p className="security-intro">
        {action === 'request'
          ? 'Enter your email and we’ll send you a password reset link.'
          : action === 'verify'
          ? 'Confirm your email to finish setting up your account.'
          : 'Choose a password between 12 and 72 characters.'}
      </p>
      <form
        className="space-y-4 my-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const data = Object.fromEntries(new FormData(e.currentTarget));
          data.token = location.hash.slice(1);
          const path =
            action === 'verify'
              ? '/email/verify'
              : action === 'reset'
              ? '/password/reset'
              : action === 'change'
              ? '/password/change'
              : '/password/reset-request';
          const r = await fetchJson('/auth' + path, {
            method: 'POST',
            body: JSON.stringify(data),
          });
          setMessage(r.success ? r.data.message : r.message);
          setBusy(false);
          if (r.success && action === 'change') {
            localStorage.removeItem('rv_token');
            localStorage.removeItem('rv_customer');
            window.location.assign('/?page=account');
          }
          if (r.success && (action === 'verify' || action === 'reset')) {
            history.replaceState(null, '', location.pathname + location.search);
          }
        }}
      >
        {action === 'request' && (
          <label className="block">
            <span>Email</span>
            <input
              className="form-input mt-1"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </label>
        )}
        {action === 'change' && (
          <label className="block">
            <span>Current password</span>
            <div className="relative mt-1">
              <input
                className="form-input pr-11"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] p-1 transition-colors"
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
        )}
        {['change', 'reset'].includes(action) && (
          <label className="block">
            <span>New password</span>
            <div className="relative mt-1">
              <input
                className="form-input pr-11"
                name="password"
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={12}
                maxLength={72}
                autoComplete="new-password"
                placeholder="12–72 characters"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] p-1 transition-colors"
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
        )}
        <button className="btn btn-primary" disabled={busy}>
          {busy
            ? 'Please wait…'
            : action === 'verify'
            ? 'Verify email'
            : action === 'request'
            ? 'Send reset link'
            : 'Save password'}
        </button>
        <p role="status">{message}</p>
      </form>
      <a href="/?page=account">Back to account</a>
    </main>
  );
}
