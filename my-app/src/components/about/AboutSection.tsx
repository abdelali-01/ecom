'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface AboutSectionItem {
  id: number;
  title: string;
  description: string;
  image?: string;
  points?: string[];
  reverse?: boolean;
}

const AboutSection = () => {
  const { t } = useTranslation();

  const aboutContent: AboutSectionItem[] = [
    {
      id: 1,
      title: t('about.mission.title'),
      description: t('about.mission.description'),
      image: "/images/about/mission.webp",
      points: t('about.mission.points', { returnObjects: true }) as string[],
    },
    {
      id: 2,
      title: t('about.vision.title'),
      description: t('about.vision.description'),
      image: "/images/about/vision.webp",
      points: t('about.vision.points', { returnObjects: true }) as string[],
      reverse: true,
    },
    {
      id: 3,
      title: t('about.values.title'),
      description: t('about.values.description'),
      image: "/images/about/values.webp",
      points: t('about.values.points', { returnObjects: true }) as string[],
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-16">
          {t('about.title')}
        </h1>

        {/* Store Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gray-800 dark:bg-gray-700 text-white p-8 md:p-12 rounded-2xl shadow-2xl mb-20 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Devali
          </h2>
          <p className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            We are passionate about bringing you the latest and greatest products, combining innovation with exceptional quality to enhance your everyday life. Discover a world of possibilities with us.
          </p>
        </motion.div>

        <div className="space-y-20">
          {aboutContent.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${item.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 lg:gap-16`}
            >
              <div className="relative w-full lg:w-1/2 h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
              <div className="w-full lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  {item.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                  {item.description}
                </p>
                {item.points && ( 
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    {item.points.map((point, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection; 