import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import registerImg from "@/assets/discussion.svg";
import { authService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

import {
  Button,
} from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full Name must be at least 3 characters")
      .max(40, "Full Name must be less than 40 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(40, "Password must be less than 40 characters")
      .regex(/[!@#$%^&*]/, "At least one special character required")
      .regex(/\d/, "At least one digit required"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Extract password value for live warnings
  const password = form.watch("password");

  // Generate live warnings based on password input
  const [passwordWarnings, setPasswordWarnings] = useState<string[]>([]);
  useEffect(() => {
    const warnings: string[] = [];

    if (password.length > 0 && password.length < 8) {
      warnings.push("Minimum 8 characters required.");
    }
    if (password.length >= 8 && !/[!@#$%^&*]/.test(password)) {
      warnings.push("At least one special character required.");
    }
    if (password.length >= 8 && !/\d/.test(password)) {
      warnings.push("At least one digit required.");
    }

    setPasswordWarnings(warnings);
  }, [password]);

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      // Call your API with username as fullName here (adjust if your backend expects username instead)
      await authService.register(data.fullName, data.email, data.password);

      toast({
        title: "Success",
        description: "Your account has been created. Please sign in.",
      });

      navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-4 bg-gradient-to-r from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      {/* Illustration */}
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

      {/* Form */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="bg-white dark:bg-card p-8 rounded-2xl shadow-lg w-full md:w-1/2 max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-primary dark:text-white">
          Create your account
        </h2>

        {error && (
          <p className="mb-4 text-red-600 text-center font-medium">{error}</p>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        {...field}
                        disabled={isSubmitting}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-300"
                        tabIndex={-1}
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Live password warnings */}
            {passwordWarnings.length > 0 && (
              <ul className="text-sm text-red-500 space-y-1 -mt-2 ml-1">
                {passwordWarnings.map((msg, idx) => (
                  <li key={idx}>• {msg}</li>
                ))}
              </ul>
            )}

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full flex justify-center items-center"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
              )}
              Register
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 underline hover:text-blue-700"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
