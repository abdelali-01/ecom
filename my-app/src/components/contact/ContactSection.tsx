'use client';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface ContactInfoItem {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  link?: string;
  action? : string ;
}

interface SocialLinkItem {
  id: number;
  icon: React.ElementType;
  name: string;
  link: string;
}

const ContactSection = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const contactInfo: ContactInfoItem[] = [
    {
      id: 1,
      icon: Mail,
      title: t('contact.email.title'),
      description: t('contact.email.address'),
      link: `mailto:contact.email.address`,
      action : t('contact.email.action')
    },
    {
      id: 2,
      icon: Phone,
      title: t('contact.phone.title'),
      description: '0668845439',
      link: `tel:0668845439`,
      action : t('contact.phone.action')
    },
    {
      id: 3,
      icon: MapPin,
      title: t('contact.address.title'),
      description: t('contact.address.location'),
      link: "https://maps.app.goo.gl/yourlocation",
      action : t('contact.map.action')
    },
  ];

  const socialLinks: SocialLinkItem[] = [
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setFeedback('');
    try {
      await axios.post(process.env.NEXT_PUBLIC_SERVER+'/api/messages', formData);
      setStatus('success');
      setFeedback(t('contact.form.success'));
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setFeedback(err?.response?.data?.message || t('contact.form.error'));
      console.log(err)
    }
  };

  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => {
        setStatus('idle');
        setFeedback('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-16">
          {t('contact.title')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center flex flex-col items-center"
            >
              <item.icon className="w-12 h-12 text-black dark:text-white mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
                {item.description}
              </p>
              {item.link && (
                <a
                  href={item.link}
                  className="text-black dark:text-white hover:underline font-semibold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.action}
                </a>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('contact.form.title')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">
                {t('contact.form.name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">
                {t('contact.form.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">
                {t('contact.form.message')}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors tracking-wide shadow-md"
            >
              {t('contact.form.submit')}
            </button>
            {feedback && (
              <div className={`text-center mt-4 font-semibold ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{feedback}</div>
            )}
          </form>
        </motion.div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800 dark:bg-gray-700 text-white p-8 rounded-xl shadow-lg mt-16 max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold mb-8">
            {t('contact.social.title')}
          </h2>
          <div className="flex justify-center gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 bg-white text-gray-800 rounded-full flex items-center justify-center text-2xl hover:bg-gray-200 transition-colors shadow-md"
                aria-label={social.name}
              >
                <social.icon size={32} />
              </a>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ContactSection; 