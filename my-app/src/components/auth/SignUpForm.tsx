"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import Select from "../form/Select";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { registerUser } from "@/store/auth/authHandler";

export interface User {
  id?: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  role?: string
}

const userState = {
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: ''
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [user, setUser] = useState<User>(userState);
  const [errors, setErrors] = useState<Partial<User>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name as keyof User]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<User> = {};
    
    if (!user.username.trim()) {
      newErrors.username = 'Admin name is required';
    }
    
    if (!user.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!user.password) {
      newErrors.password = 'Password is required';
    } else if (user.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!user.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (user.password !== user.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!user.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(registerUser(user, () => setUser(userState)));
    }
  }

  return (
    <div className="flex flex-col flex-1 w-full lg:max-w-3/4 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Register your admin
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the information below to register your admin!
            </p>
          </div>
          <div>
            <form onSubmit={submitHandler}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Admin Name */}
                  <div className="sm:col-span-2">
                    <Label>
                      Admin Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Enter your admin name"
                      required
                      value={user.username}
                      onChange={handleChange}
                      className={errors.username ? 'border-error-500' : ''}
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-error-500">{errors.username}</p>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="sm:col-span-1">
                    <Label>
                      Phone number
                    </Label>
                    <Input
                      type="text"
                      id="phone"
                      name="phone"
                      placeholder="Enter your admin phone"
                      value={user.phone}
                      onChange={handleChange}
                      className={errors.phone ? 'border-error-500' : ''}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-error-500">{errors.phone}</p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <Label>
                      Email<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your admin email"
                      required
                      value={user.email}
                      onChange={handleChange}
                      className={errors.email ? 'border-error-500' : ''}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-error-500">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Section */}
                  <div className="sm:col-span-1">
                    <Label>
                      Password<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="Enter your admin password"
                        type={showPassword ? "text" : "password"}
                        required
                        name="password"
                        value={user.password}
                        onChange={handleChange}
                        minLength={8}
                        className={errors.password ? 'border-error-500' : ''}
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
                    {errors.password && (
                      <p className="mt-1 text-sm text-error-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <Label>
                      Confirm Password<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="Confirm your password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        name="confirmPassword"
                        value={user.confirmPassword}
                        onChange={handleChange}
                        minLength={8}
                        className={errors.confirmPassword ? 'border-error-500' : ''}
                      />
                      <span
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-error-500">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div className="sm:col-span-2">
                    <Label>Role <span className="text-error-500">*</span></Label>
                    <Select 
                      options={[
                        { value: 'super', label: 'Super admin' },
                        { value: 'sub-super', label: 'Admin' },
                        { value: 'manager', label: 'Order manager' },
                      ]}
                      onChange={(value) => {
                        setUser(prev => ({ ...prev, role: value }));
                        if (errors.role) {
                          setErrors(prev => ({ ...prev, role: undefined }));
                        }
                      }}
                      required={true}
                      className={errors.role ? 'border-error-500' : ''}
                    />
                    {errors.role && (
                      <p className="mt-1 text-sm text-error-500">{errors.role}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="sm:col-span-2">
                  <button 
                    type="submit"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                  >
                    Register Admin
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
