'use client';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Target,
  Eye,
  Heart,
  Shield,
  Leaf,
  Award,
  Users,
  Globe,
  Star,
  Zap,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface AboutSectionItem {
  id: number;
  title: {
    en: string;
    fr: string;
    ar: string;
  };
  description: {
    en: string;
    fr: string;
    ar: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  points: {
    en: string[];
    fr: string[];
    ar: string[];
  };
  color: string;
  bgColor: string;
}

const AboutSection = () => {
  const { t, i18n } = useTranslation();

  const aboutContent: AboutSectionItem[] = [
    {
      id: 1,
      title: {
        en: "Our Mission",
        fr: "Notre mission",
        ar: "مهمتنا"
      },
      description: {
        en: "To offer premium natural honey sourced from trusted beekeepers, ensuring health, purity, and satisfaction in every drop.",
        fr: "Offrir un miel naturel de qualité, issu d'apiculteurs de confiance, garantissant santé, pureté et satisfaction dans chaque goutte.",
        ar: "تقديم عسل طبيعي عالي الجودة من مصادر موثوقة، يضمن الصحة والنقاء والرضا في كل قطرة."
      },
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      points: {
        en: [
          "Pure and natural ingredients",
          "Support for local beekeepers",
          "Commitment to customer well-being"
        ],
        fr: [
          "Ingrédients purs et naturels",
          "Soutien aux apiculteurs locaux",
          "Engagement pour le bien-être du client"
        ],
        ar: [
          "مكونات طبيعية ونقية",
          "دعم النحالين المحليين",
          "الالتزام بصحة ورضا العملاء"
        ]
      }
    },
    {
      id: 2,
      title: {
        en: "Our Vision",
        fr: "Notre vision",
        ar: "رؤيتنا"
      },
      description: {
        en: "To become a trusted name in the natural honey industry by maintaining unmatched quality and a deep respect for nature.",
        fr: "Devenir une marque de confiance dans le domaine du miel naturel en maintenant une qualité inégalée et un profond respect de la nature.",
        ar: "أن نصبح علامة موثوقة في مجال العسل الطبيعي من خلال الحفاظ على جودة لا مثيل لها واحترام عميق للطبيعة."
      },
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      points: {
        en: [
          "Leading innovation in honey production",
          "Expanding awareness of natural health",
          "Building a loyal customer base"
        ],
        fr: [
          "Innover dans la production de miel",
          "Sensibiliser à la santé naturelle",
          "Construire une clientèle fidèle"
        ],
        ar: [
          "الريادة في تطوير صناعة العسل",
          "نشر الوعي بالصحة الطبيعية",
          "بناء قاعدة عملاء وفية"
        ]
      }
    },
    {
      id: 3,
      title: {
        en: "Our Values",
        fr: "Nos valeurs",
        ar: "قيمنا"
      },
      description: {
        en: "Integrity, sustainability, and passion for quality guide everything we do at our honey store.",
        fr: "L'intégrité, la durabilité et la passion pour la qualité guident tout ce que nous faisons dans notre boutique de miel.",
        ar: "النزاهة، الاستدامة، والشغف بالجودة هي المبادئ التي توجه كل ما نقوم به في متجر العسل الخاص بنا."
      },
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      points: {
        en: [
          "Integrity in every step",
          "Eco-friendly practices",
          "Passion for excellence"
        ],
        fr: [
          "Intégrité à chaque étape",
          "Pratiques respectueuses de l'environnement",
          "Passion pour l'excellence"
        ],
        ar: [
          "النزاهة في كل خطوة",
          "ممارسات صديقة للبيئة",
          "شغف بالتميز"
        ]
      }
    }
  ];

  const storeDescription: Record<string, string> = {
    ar: "نقدم لك أجود أنواع العسل الطبيعي، مستخلص من أفضل المناحل وبجودة عالية. اكتشف فوائد العسل وتمتع بطعم أصيل يعكس نقاء الطبيعة.",
    en: "We offer you the finest natural honey, sourced from the best beehives and crafted with top quality. Discover the benefits of honey and enjoy an authentic taste that reflects the purity of nature.",
    fr: "Nous vous proposons le meilleur miel naturel, issu des meilleures ruches et de qualité supérieure. Découvrez les bienfaits du miel et savourez un goût authentique qui reflète la pureté de la nature."
  };

  const features = [
    {
      icon: Shield,
      title: { en: "100% Natural", fr: "100% Naturel", ar: "طبيعي 100%" },
      description: { en: "Pure honey without additives", fr: "Miel pur sans additifs", ar: "عسل نقي بدون إضافات" }
    },
    {
      icon: Leaf,
      title: { en: "Eco-Friendly", fr: "Écologique", ar: "صديق للبيئة" },
      description: { en: "Sustainable beekeeping practices", fr: "Pratiques apicoles durables", ar: "ممارسات نحل مستدامة" }
    },
    {
      icon: Award,
      title: { en: "Premium Quality", fr: "Qualité Premium", ar: "جودة عالية" },
      description: { en: "Highest quality standards", fr: "Normes de qualité les plus élevées", ar: "أعلى معايير الجودة" }
    },
    {
      icon: Users,
      title: { en: "Local Support", fr: "Soutien Local", ar: "دعم محلي" },
      description: { en: "Supporting local beekeepers", fr: "Soutenir les apiculteurs locaux", ar: "دعم النحالين المحليين" }
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            {t('about.title')}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Store Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-8 md:p-12 rounded-3xl shadow-2xl mb-20 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <Star className="w-12 h-12 text-yellow-300 mr-4" />
              <h2 className="text-4xl md:text-5xl font-extrabold">
                Bioasis
              </h2>
              <Star className="w-12 h-12 text-yellow-300 ml-4" />
            </div>
            <p className="text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
              {storeDescription[i18n.language as keyof typeof storeDescription]}
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {feature.title[i18n.language as keyof typeof feature.title]}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description[i18n.language as keyof typeof feature.description]}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="space-y-16">
          {aboutContent.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
            >
              {/* Icon Section */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className={`w-48 h-48 ${item.bgColor} rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <item.icon className={`w-24 h-24 ${item.color} relative z-10`} />
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full opacity-30"></div>
                </motion.div>
              </div>

              {/* Content Section */}
              <div className="w-full lg:w-1/2">
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <Zap className={`w-8 h-8 ${item.color}`} />
                    {item.title[i18n.language as keyof typeof item.title]}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8">
                    {item.description[i18n.language as keyof typeof item.description]}
                  </p>
                  {item.points && (
                    <ul className="space-y-4">
                      {item.points[i18n.language as keyof typeof item.points].map((point, pointIndex) => (
                        <motion.li
                          key={pointIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.5 + pointIndex * 0.1 }}
                          className="flex items-center gap-3 text-gray-600 dark:text-gray-400 group"
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-lg">{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 md:p-12 rounded-3xl text-white">
            <Globe className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {i18n.language === 'en' ? 'Discover the Magic of Natural Honey' :
                i18n.language === 'fr' ? 'Découvrez la Magie du Miel Naturel' :
                  'اكتشف سحر العسل الطبيعي'}
            </h3>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              {i18n.language === 'en' ? 'Join thousands of satisfied customers who trust Bioasis for their daily dose of natural goodness.' :
                i18n.language === 'fr' ? 'Rejoignez des milliers de clients satisfaits qui font confiance à Bioasis pour leur dose quotidienne de bienfaits naturels.' :
                  'انضم إلى آلاف العملاء الراضين الذين يثقون بـ Bioasis للحصول على جرعتهم اليومية من الخير الطبيعي.'}
            </p>
            <Link href={'/shop'}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300"
              >
                {i18n.language === 'en' ? 'Explore Our Products' :
                  i18n.language === 'fr' ? 'Explorer Nos Produits' :
                    'استكشف منتجاتنا'}
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection; 