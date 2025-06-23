'use client';

import Link from 'next/link'
import React from 'react'
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const socialLinks = [
  {
    id: 1,
    icon: Facebook,
    name: "Facebook",
    link: "https://facebook.com/yourstore",
  },
  {
    id: 3,
    icon: Instagram,
    name: "Instagram",
    link: "https://instagram.com/yourstore",
  },
  {
    id: 4,
    icon: Linkedin,
    name: "LinkedIn",
    link: "https://linkedin.com/company/yourstore",
  },
];

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              {/* <Image src={'/logo.png'} width={60} height={60} alt='bioasis logo' /> */}
            <h3 className="text-xl md:text-3xl font-bold dark:text-white">LOGO</h3>
            </Link>
          </div>

          {/* Social Media Links */}
          <div className="flex space-x-6">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label={social.name}
              >
                <social.icon size={24} />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 w-full">
            <p className="text-base text-gray-400 text-center">
              {t('footer.rights', { year: currentYear })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
