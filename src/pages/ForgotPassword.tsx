import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Mail, Loader, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your email for password reset instructions.');
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to send reset email. Please verify the address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="max-w-md w-full space-y-8 bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Reset Password</h1>
          <p className="text-[var(--text-secondary)]">
            Enter your email to receive reset instructions
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
            <AlertTriangle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle size={20} />
            <span className="text-sm">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[var(--text-tertiary)]" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center pt-6 border-t border-[var(--border-color)]">
          <Link
            to="/login"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
