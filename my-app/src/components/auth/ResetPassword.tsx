"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store/store";
import ButtonLoader from "../ui/load/ButtonLoader";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { requestPasswordReset, verifyResetToken, resetPassword } from "@/store/auth/passwordResetHandler";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { token } = useParams();

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Verify token on component mount if token exists
  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    setIsLoading(true);
    const result = await dispatch(verifyResetToken(token as string));
    setIsLoading(false);
    
    if (result.success) {
      setIsTokenValid(true);
      setUserEmail(result.email);
    } else {
      setIsTokenValid(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await dispatch(requestPasswordReset(email));
    setIsLoading(false);
    
    if (result.success) {
      setIsSubmitted(true);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return;
    }
    
    if (password.length < 8) {
      return;
    }
    
    setIsLoading(true);
    const result = await dispatch(resetPassword(token as string, password));
    setIsLoading(false);
    
    if (result.success) {
      router.push('/signin');
    }
  };

  const validatePassword = () => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to Sign In
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        {!token ? (
          // Email input form
          <>
            {isSubmitted ? (
              <>
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Check your email
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                  We sent a password reset link to your email address.
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-4" 
                  startIcon={<QuestionMarkCircleIcon className="size-6"/>}
                  onClick={() => setIsSubmitted(false)}
                >
                  Send another link
                </Button>
              </>
            ) : (
              <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                    Reset your password
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            <div>
                  <form onSubmit={handleEmailSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label>
                          Email <span className="text-error-500">*</span>
                    </Label>
                        <Input 
                          placeholder="example@gmail.com" 
                          type="email" 
                          required 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          name="email" 
                        />
                  </div>
                  <div>
                        <Button className="w-full" size="sm" disabled={isLoading}>
                          {isLoading ? <ButtonLoader /> : 'Send Reset Link'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
              </div>
            )}
          </>
        ) : (
          // Password reset form
          <>
            {isLoading ? (
              <div className="text-center">
                <ButtonLoader />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Verifying reset link...
                </p>
              </div>
            ) : !isTokenValid ? (
              <div className="text-center">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Invalid Reset Link
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This password reset link is invalid or has expired.
                </p>
                <Button 
                  size="sm" 
                  className="mt-4"
                  onClick={() => router.push('/reset-password')}
                >
                  Request New Link
                </Button>
              </div>
            ) : (
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                    Set new password
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter your new password for {userEmail}
              </p>
            </div>
            <div>
                  <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label>
                          New Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                        name="password"
                        required
                            minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                        <Label>
                          Confirm Password <span className="text-error-500">*</span>
                        </Label>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          name="confirmPassword"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      {validatePassword() && (
                        <p className="text-sm text-error-500">{validatePassword()}</p>
                      )}
                      <div>
                        <Button 
                          className="w-full" 
                          size="sm" 
                          disabled={isLoading || !!validatePassword()}
                        >
                          {isLoading ? <ButtonLoader /> : 'Reset Password'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
