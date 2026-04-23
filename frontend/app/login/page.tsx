'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '../../lib/api';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, Sparkles, Key, Loader2 } from 'lucide-react';

type Tab = 'signin' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { login: setAuthUser } = useAuth();
  const [tab, setTab] = useState<Tab>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Background mouse tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const resetForm = (nextTab: Tab) => {
    setTab(nextTab);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (tab === 'register') {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = tab === 'signin'
        ? await login(username, password)
        : await register(username, password);

      setAuthUser(res.data.access_token, res.data.user);
      toast.success(tab === 'signin' ? 'Signed in successfully!' : 'Registered successfully!');
      router.push('/inventory');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : (msg || 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0a0a0a] overflow-hidden px-4">
      
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full bg-indigo-600/20 blur-[120px]"
          animate={{
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
          }}
          transition={{ type: "tween", ease: "easeOut", duration: 2 }}
        />
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen animate-pulse duration-10000" />
      </div>

      <motion.div 
        className="w-full max-w-[420px] relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 mb-6 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] border border-white/10"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
            Inventra
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Enterprise Stock Management</p>
        </motion.div>

        {/* Form Card */}
        <motion.div 
          variants={itemVariants}
          className="backdrop-blur-xl bg-gray-900/40 border border-gray-800/60 rounded-3xl p-8 shadow-2xl"
        >
          {/* Tabs */}
          <div className="flex bg-gray-950/50 rounded-2xl p-1 mb-8 border border-gray-800/50 relative">
            <motion.div 
              className="absolute inset-y-1 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl shadow-lg"
              initial={false}
              animate={{
                left: tab === 'signin' ? '4px' : 'calc(50% + 2px)',
                width: 'calc(50% - 6px)'
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button
              type="button"
              onClick={() => resetForm('signin')}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-colors relative z-10 ${
                tab === 'signin' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => resetForm('register')}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-colors relative z-10 ${
                tab === 'register' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={tab === 'register' ? 3 : 1}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-950/50 border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                  placeholder={tab === 'signin' ? 'admin' : 'Choose a username'}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-950/50 border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            {/* Confirm Password (register only) */}
            <AnimatePresence mode="popLayout">
              {tab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2 ml-1 mt-1">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-950/50 border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                      placeholder="••••••••"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden py-3.5 px-4 bg-white hover:bg-gray-100 disabled:bg-gray-500 text-black font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]" />
                
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {tab === 'signin' ? 'Authenticating...' : 'Creating...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {tab === 'signin' ? 'Continue' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer Hints */}
        <motion.div variants={itemVariants} className="text-center mt-8 space-y-2">
          {tab === 'signin' ? (
            <p className="text-gray-500 text-sm">
              Default admin: <span className="text-gray-300 bg-gray-800 px-2 py-0.5 rounded-md font-mono">admin</span> / <span className="text-gray-300 bg-gray-800 px-2 py-0.5 rounded-md font-mono">admin123</span>
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              New accounts start with the <span className="text-indigo-400 font-medium">user</span> role.
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
