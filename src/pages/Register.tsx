// src/pages/Register.tsx
import { motion } from "framer-motion";
import registerImg from "@/assets/discussion.svg"; // Add this to assets folder

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-4 bg-gradient-to-r from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      
      {/* Left Section: Illustration */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden md:block w-full md:w-1/2 p-6"
      >
        <img
          src={registerImg}
          alt="Join Discussion"
          className="w-full max-w-md mx-auto"
        />
        <p className="text-center text-muted-foreground mt-4 text-lg">
          Join conversations in tech, science, art, and more!
        </p>
      </motion.div>

      {/* Right Section: Form */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="bg-white dark:bg-card p-8 rounded-2xl shadow-lg w-full md:w-1/2 max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-primary dark:text-white">
          Create your account
        </h2>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-800 transition"
          >
            Register
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;