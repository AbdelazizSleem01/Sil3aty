"use client";
import {
  Globe,
  ShieldCheck,
  Package,
  Clock,
  Users,
  Sparkles,
  Target,
  Rocket,
  Heart,
  Zap,
  Award,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaYoutube,
} from "react-icons/fa";
import Image from "next/image";

const SectionWrapper = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

const getIconComponent = (iconName) => {
  const iconMap = {
    Users,
    Globe,
    Package,
    ShieldCheck,
    Clock,
    Sparkles,
    Target,
    Rocket,
    Heart,
    Zap,
    Award,
    TrendingUp,
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaTwitter,
    FaGithub,
    FaYoutube,
  };
  return iconMap[iconName] || Users;
};

const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-20 left-10 w-6 h-6 bg-primary/20 rounded-full animate-float"></div>
    <div className="absolute top-40 right-20 w-8 h-8 bg-secondary/20 rounded-full animate-float delay-1000"></div>
    <div className="absolute bottom-32 left-20 w-4 h-4 bg-accent/20 rounded-full animate-float delay-2000"></div>
    <div className="absolute bottom-20 right-32 w-10 h-10 bg-primary/15 rounded-full animate-float delay-1500"></div>
  </div>
);

const StatCard = ({ value, label, icon }) => {
  const IconComponent = getIconComponent(icon);
  return (
    <motion.div
      className="group p-8 bg-gradient-to-br from-base-100 to-base-200 rounded-2xl border border-base-300/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          {value}
        </div>
        <div className="text-gray-600 font-medium">{label}</div>
      </div>
    </motion.div>
  );
};

const ValueCard = ({ icon, title, description, color = "primary" }) => {
  const IconComponent = getIconComponent(icon);
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 border-primary/20",
    secondary: "from-secondary/20 to-secondary/5 border-secondary/20",
    accent: "from-accent/20 to-accent/5 border-accent/20",
  };

  return (
    <motion.div
      className={`group p-8 bg-gradient-to-br ${colorClasses[color]} rounded-3xl border backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="absolute top-4 right-4 opacity-10">
        <IconComponent className="w-20 h-20" />
      </div>
      <div className="relative z-10">
        <div
          className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-${color} to-${color} rounded-2xl mb-6 group-hover:rotate-12 transition-transform duration-500`}
        >
          <IconComponent className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

const TeamMember = ({
  name,
  position,
  description,
  image,
  facebook,
  linkedin,
  instagram,
}) => (
  <motion.div
    className="group relative bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 transition-all duration-500 hover:bg-gradient-to-br hover:from-primary/5 hover:to-secondary/5 border border-base-300/50 shadow-lg hover:shadow-2xl"
    whileHover={{ y: -10 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="w-36 h-36 rounded-full bg-gradient-to-r from-primary to-secondary p-1.5 group-hover:scale-110 transition-transform duration-500">
          <img
            loading="lazy"
            src={image}
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
            alt={name}
          />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{name}</h3>
      <p className="text-primary font-semibold mb-4 bg-primary/10 px-4 py-1 rounded-full">
        {position}
      </p>
      <p className="text-gray-600 leading-relaxed">{description}</p>

      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        {facebook && (
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-base-200 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors duration-300"
            title="Facebook"
          >
            <FaFacebook className="w-4 h-4" />
          </a>
        )}
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-base-200 rounded-full flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-colors duration-300"
            title="LinkedIn"
          >
            <FaLinkedin className="w-4 h-4" />
          </a>
        )}
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-base-200 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors duration-300"
            title="Instagram"
          >
            <FaInstagram className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  </motion.div>
);

// Modern Timeline Item
const TimelineItem = ({ year, title, content, index }) => (
  <motion.div
    className="relative mb-16 md:w-1/2 md:ml-auto md:odd:ml-0 md:odd:mr-auto md:even:translate-y-20"
    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: index * 0.2 }}
  >
    <div className="absolute left-0 md:left-[-32px] w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full border-4 border-base-100 shadow-lg flex items-center justify-center z-20">
      <div className="w-2 h-2 bg-white rounded-full"></div>
    </div>
    <div className="ml-16 md:ml-0 p-8 bg-gradient-to-br from-base-100 to-base-200 rounded-3xl shadow-xl border border-base-300/50 hover:shadow-2xl transition-all duration-500 group">
      <div className="text-sm text-primary font-semibold mb-2 bg-primary/10 px-3 py-1 rounded-full inline-block">
        {year}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{content}</p>
    </div>
  </motion.div>
);

// Modern CTA Button
const CTAButton = ({ text, href, variant = "primary" }) => {
  const baseClasses =
    "btn btn-lg px-8 rounded-2xl font-semibold transform transition-all duration-300 relative overflow-hidden group";
  const variants = {
    primary:
      "btn-primary bg-gradient-to-r from-primary to-secondary border-0 text-white hover:shadow-2xl hover:-translate-y-1",
    outline:
      "btn-outline border-2 border-primary text-primary hover:bg-primary hover:text-white hover:border-primary hover:-translate-y-1",
  };

  return (
    <Link href={href} className={`${baseClasses} ${variants[variant]}`}>
      <span className="relative z-10 flex items-center gap-2">
        {text}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
    </Link>
  );
};

const ArrowRight = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />
  </svg>
);

export default function AboutPage() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutUsData();
  }, []);

  useEffect(() => {
    if (aboutData) {
      document.title = aboutData.seo.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", aboutData.seo.description);
      }
    }
  }, [aboutData]);

  const fetchAboutUsData = async () => {
    try {
      const response = await fetch("/api/admin/about-us");
      if (!response.ok) throw new Error("Failed to fetch about us data");
      const data = await response.json();
      setAboutData(data);
    } catch (err) {
      toast.error("Failed to load about us content");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-20 w-20 border-4 border-primary border-t-transparent mx-auto mb-6"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            Loading Amazing Content...
          </motion.div>
        </div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-8xl mb-6">🚀</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Content Coming Soon
          </div>
          <p className="text-gray-600 max-w-md">
            We're preparing something extraordinary for you. Please check back
            soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-primary/5 overflow-hidden">
      <section className="relative py-14 flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 overflow-hidden">
        <FloatingElements />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

        <div className="text-center max-w-6xl px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3 mb-8"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-gray-700">
              WELCOME TO Sil3aty
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black leading-tight mb-6"
          >
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
              {aboutData.hero.title.split(" ")[0]}
            </span>
            <br />
            <span className="text-3xl md:text-5xl font-semibold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
              {aboutData.hero.title.split(" ").slice(1).join(" ")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl font-light text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            {aboutData.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-3 bg-gray-400 rounded-full mt-2"
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <SectionWrapper>
        <div className="container mx-auto px-4 py-32">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              className="space-y-8"
              whileInView={{ x: 0, opacity: 1 }}
              initial={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-primary text-sm font-semibold tracking-wide">
                  {aboutData.mission.badge}
                </span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {aboutData.mission.title}
                </span>
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed">
                {aboutData.mission.description}
              </p>

              <div className="grid grid-cols-2 gap-6">
                {aboutData.mission.stats.map((stat, index) => (
                  <StatCard key={index} {...stat} />
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative group"
              whileInView={{ x: 0, opacity: 1 }}
              initial={{ x: 50, opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-4xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative overflow-hidden rounded-3xl border-2 border-white shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500">
                <Image
                  src={aboutData.mission.image}
                  alt="Team"
                  className="w-full h-[420px] object-cover transform group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  width={400}
                  height={600}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* Timeline Section */}
      <SectionWrapper delay={0.2}>
        <div className="bg-gradient-to-br from-base-200 to-base-100 py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=80')] opacity-5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.h2
              className="text-5xl md:text-6xl font-bold text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {aboutData.timeline.title}
              </span>
            </motion.h2>

            <div className="relative pl-8 md:pl-0">
              <div className="absolute left-0 md:left-1/2 w-1 h-full bg-gradient-to-b from-primary to-secondary shadow-lg"></div>
              {aboutData.timeline.items.map((item, index) => (
                <TimelineItem key={index} {...item} index={index} />
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Team Section */}
      <SectionWrapper delay={0.3}>
        <div className="container mx-auto px-4 py-32">
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {aboutData.team.title}
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aboutData.team.members.map((member, index) => (
              <TeamMember key={index} {...member} />
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Values Section */}
      <SectionWrapper delay={0.4}>
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-32">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-5xl md:text-6xl font-bold text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {aboutData.values.title}
              </span>
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aboutData.values.items.map((value, index) => (
                <ValueCard key={index} {...value} />
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Enhanced CTA Section */}
      <SectionWrapper delay={0.5}>
        <div className="container mx-auto px-4 py-32 text-center">
          <motion.div
            className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 p-16 rounded-4xl border border-white/20 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>

            <h2 className="text-5xl md:text-6xl font-bold mb-8 relative z-10">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {aboutData.cta.title}
              </span>
            </h2>

            <p className="text-2xl text-gray-600 mb-12 relative z-10">
              {aboutData.cta.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              {aboutData.cta.buttons.map((button, index) => (
                <CTAButton key={index} {...button} />
              ))}
            </div>
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
}
