import { Facebook, Twitter, Instagram } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t, language } = useLanguage();
  const footerLists = {
    en: {
      places: ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami", "Seattle"],
      stream: ["About us", "Careers", "Press", "News", "Media kit", "Contact"],
      jobPlaces: ["Blog", "Newsletter", "Events", "Help center", "Tutorials", "Supports"],
      jobsByStreams: ["Startups", "Enterprise", "Government", "SaaS", "Marketplaces", "Ecommerce"],
      smallLinks: ["Startups", "Enterprise"],
      sitemap: ["Startups"],
    },
    es: {
      places: ["Nueva York", "Los Ángeles", "Chicago", "San Francisco", "Miami", "Seattle"],
      stream: ["Sobre nosotros", "Carreras", "Prensa", "Noticias", "Kit de prensa", "Contacto"],
      jobPlaces: ["Blog", "Boletín", "Eventos", "Centro de ayuda", "Tutoriales", "Soporte"],
      jobsByStreams: ["Startups", "Empresas", "Gobierno", "SaaS", "Mercados", "Comercio electrónico"],
      smallLinks: ["Startups", "Empresas"],
      sitemap: ["Startups"],
    },
    hi: {
      places: ["न्यूयॉर्क", "लॉस एंजेलिस", "शिकागो", "सैन फ्रांसिस्को", "मियामी", "सिएटल"],
      stream: ["हमारे बारे में", "करियर", "प्रेस", "समाचार", "मीडिया किट", "संपर्क"],
      jobPlaces: ["ब्लॉग", "न्यूज़लेटर", "इवेंट्स", "सहायता केंद्र", "ट्यूटोरियल", "सपोर्ट"],
      jobsByStreams: ["स्टार्टअप", "एंटरप्राइज़", "सरकार", "SaaS", "मार्केटप्लेस", "ई-कॉमर्स"],
      smallLinks: ["स्टार्टअप", "एंटरप्राइज़"],
      sitemap: ["स्टार्टअप"],
    },
    pt: {
      places: ["Nova York", "Los Angeles", "Chicago", "São Francisco", "Miami", "Seattle"],
      stream: ["Sobre nós", "Carreiras", "Imprensa", "Notícias", "Kit de mídia", "Contato"],
      jobPlaces: ["Blog", "Newsletter", "Eventos", "Central de ajuda", "Tutoriais", "Suporte"],
      jobsByStreams: ["Startups", "Empresas", "Governo", "SaaS", "Marketplaces", "E-commerce"],
      smallLinks: ["Startups", "Empresas"],
      sitemap: ["Startups"],
    },
    zh: {
      places: ["纽约", "洛杉矶", "芝加哥", "旧金山", "迈阿密", "西雅图"],
      stream: ["关于我们", "职业", "新闻", "资讯", "媒体包", "联系"],
      jobPlaces: ["博客", "新闻通讯", "活动", "帮助中心", "教程", "支持"],
      jobsByStreams: ["初创公司", "企业", "政府", "SaaS", "平台", "电子商务"],
      smallLinks: ["初创公司", "企业"],
      sitemap: ["初创公司"],
    },
    fr: {
      places: ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami", "Seattle"],
      stream: ["À propos de nous", "Carrières", "Presse", "Actualités", "Kit média", "Contact"],
      jobPlaces: ["Blog", "Newsletter", "Événements", "Centre d'aide", "Tutoriels", "Assistance"],
      jobsByStreams: ["Startups", "Entreprises", "Gouvernement", "SaaS", "Places de marché", "E-commerce"],
      smallLinks: ["Startups", "Entreprises"],
      sitemap: ["Startups"],
    },
  } as const;
  const current = footerLists[language];
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <FooterSection title={t("footerPlacesTitle")} items={current.places} />
          <FooterSection title={t("footerStreamTitle")} items={current.stream} />
          <FooterSection title={t("footerJobPlacesTitle")} items={current.jobPlaces} links />
          <FooterSection title={t("footerJobsByStreamsTitle")} items={current.jobsByStreams} links />
        </div>

        <hr className="my-10 border-gray-600" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <FooterSection title={t("footerAboutUsTitle")} items={current.smallLinks} links />
          <FooterSection title={t("footerTeamDiaryTitle")} items={current.smallLinks} links />
          <FooterSection title={t("footerTermsTitle")} items={current.smallLinks} links />
          <FooterSection title={t("footerSitemapTitle")} items={current.sitemap} links />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-between items-center">
          <p className="flex items-center gap-2 border border-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700">
            <i className="bi bi-google-play"></i> {t("footerAndroidApp")}
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Facebook className="w-6 h-6 hover:text-blue-400 cursor-pointer" />
            <Twitter className="w-6 h-6 hover:text-blue-400 cursor-pointer" />
            <Instagram className="w-6 h-6 hover:text-pink-400 cursor-pointer" />
          </div>
          <p className="mt-4 sm:mt-0 text-sm text-gray-400">{t("footerCopyright")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({ title, items, links }:any) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-300">{title}</h3>
      <div className="flex flex-col items-start mt-4 space-y-3">
        {items.map((item:any, index:any) =>
          links ? (
            <a key={index} href="/" className="text-gray-400 hover:text-blue-400 hover:underline">
              {item}
            </a>
          ) : (
            <p key={index} className="text-gray-400 hover:text-blue-400 hover:underline cursor-pointer">
              {item}
            </p>
          )
        )}
      </div>
    </div>
  );
}