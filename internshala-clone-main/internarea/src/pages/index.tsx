import { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import {
  ArrowUpRight,
  Banknote,
  Calendar,
  ChevronRight,
  MapPin,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import CategoryFilter from "@/Components/CategoryFilter";
import firstSlide from "../Assets/Firstslide.png";
import secondSlide from "../Assets/secondslide.webp";
import thirdSlide from "../Assets/thirdsilde.webp";
import fourthSlide from "../Assets/fourthslide.webp";


export default function SvgSlider() {
  const { t, language } = useLanguage();
  const fallbackInternships = [
    {
      _id: "1",
      title: "Software Engineering Intern",
      company: "Google",
      location: "Remote",
      stipend: "$1,500/month",
      duration: "3 months",
      category: "Engineering",
    },
    {
      _id: "2",
      title: "Marketing Intern",
      company: "Meta",
      location: "New York",
      stipend: "$1,200/month",
      duration: "6 months",
      category: "Media",
    },
    {
      _id: "3",
      title: "Graphic Design Intern",
      company: "Adobe",
      location: "San Francisco",
      stipend: "$1,000/month",
      duration: "4 months",
      category: "Design",
    },
  ];

  // const jobs = [
  //   {
  //     _id: "101",
  //     title: "Frontend Developer",
  //     company: "Amazon",
  //     location: "Seattle",
  //     CTC: "$100K/year",
  //     Experience: "2+ years",
  //     category: "Engineering",
  //   },
  //   {
  //     _id: "102",
  //     title: "Data Analyst",
  //     company: "Microsoft",
  //     location: "Remote",
  //     CTC: "$90K/year",
  //     Experience: "1+ years",
  //     category: "Data Science",
  //   },
  //   {
  //     _id: "103",
  //     title: "UX Designer",
  //     company: "Apple",
  //     location: "California",
  //     CTC: "$110K/year",
  //     Experience: "3+ years",
  //     category: "Design",
  //   },
  // ];
  const pageText = {
    en: {
      slides: ["Start Your Career Journey", "Learn From The Best", "Grow Your Skills", "Connect With Top Companies"],
      categories: ["Big Brands", "Work From Home", "Part-time", "MBA", "Engineering", "Media", "Design", "Data Science"],
      stats: ["companies hiring", "new openings everyday", "active students", "learners"],
    },
    es: {
      slides: ["Empieza tu camino profesional", "Aprende de los mejores", "Mejora tus habilidades", "Conecta con las mejores empresas"],
      categories: ["Grandes marcas", "Trabajo remoto", "Medio tiempo", "MBA", "Ingeniería", "Medios", "Diseño", "Ciencia de datos"],
      stats: ["empresas contratando", "nuevas vacantes cada día", "estudiantes activos", "aprendices"],
    },
    hi: {
      slides: ["अपनी करियर यात्रा शुरू करें", "सर्वश्रेष्ठ से सीखें", "अपने कौशल बढ़ाएं", "शीर्ष कंपनियों से जुड़ें"],
      categories: ["बड़े ब्रांड", "घर से काम", "पार्ट-टाइम", "MBA", "इंजीनियरिंग", "मीडिया", "डिज़ाइन", "डेटा साइंस"],
      stats: ["कंपनियां भर्ती कर रही हैं", "हर दिन नई रिक्तियां", "सक्रिय छात्र", "सीखने वाले"],
    },
    pt: {
      slides: ["Comece sua jornada profissional", "Aprenda com os melhores", "Cresça suas habilidades", "Conecte-se com grandes empresas"],
      categories: ["Grandes marcas", "Trabalho remoto", "Meio período", "MBA", "Engenharia", "Mídia", "Design", "Ciência de dados"],
      stats: ["empresas contratando", "novas vagas todos os dias", "estudantes ativos", "alunos"],
    },
    zh: {
      slides: ["开启你的职业旅程", "向最优秀的人学习", "提升你的技能", "连接顶级公司"],
      categories: ["大品牌", "远程工作", "兼职", "MBA", "工程", "媒体", "设计", "数据科学"],
      stats: ["家公司正在招聘", "每天都有新职位", "活跃学生", "学习者"],
    },
    fr: {
      slides: ["Commencez votre parcours professionnel", "Apprenez des meilleurs", "Développez vos compétences", "Connectez-vous aux meilleures entreprises"],
      categories: ["Grandes marques", "Télétravail", "Temps partiel", "MBA", "Ingénierie", "Média", "Design", "Science des données"],
      stats: ["entreprises qui recrutent", "nouvelles offres chaque jour", "étudiants actifs", "apprenants"],
    },
  } as const;

  const current = pageText[language];
  const slides = current.slides.map((title, index) => ({
    pattern: `pattern-${index + 1}`,
    title,
    bgColor: ["bg-indigo-600", "bg-blue-600", "bg-purple-600", "bg-teal-600"][index],
    image: [firstSlide, secondSlide, thirdSlide, fourthSlide][index],
  }));

  const stats = [
    { number: "300K+", label: current.stats[0] },
    { number: "10K+", label: current.stats[1] },
    { number: "21Mn+", label: current.stats[2] },
    { number: "600K+", label: current.stats[3] },
  ];
  const [internships, setInternships] = useState<any[]>([]);
  const [isInternshipsLoading, setIsInternshipsLoading] = useState(true);
  const [internshipsError, setInternshipsError] = useState("");

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setInternshipsError("");
        const res = await axios.get("https://internarea-a04s.onrender.com/api/internship");
        const apiInternships = Array.isArray(res.data) ? res.data : [];
        setInternships(
          apiInternships.length > 0 ? apiInternships : fallbackInternships
        );
      } catch (e) {
        console.log(e);
        setInternshipsError("Unable to fetch internships. Showing available internships.");
        setInternships(fallbackInternships);
      } finally {
        setIsInternshipsLoading(false);
      }
    };

    fetchInternships();
  }, [fallbackInternships]);







  const jobs = [
    {
      _id: "101",
      title: "Frontend Developer",
      company: "Amazon",
      location: "Seattle",
      CTC: "$100K/year",
      Experience: "2+ years",
      category: "Engineering",
    },
    {
      _id: "102",
      title: "Data Analyst",
      company: "Microsoft",
      location: "Remote",
      CTC: "$90K/year",
      Experience: "1+ years",
      category: "Data Science",
    },
    {
      _id: "103",
      title: "UX Designer",
      company: "Apple",
      location: "California",
      CTC: "$110K/year",
      Experience: "3+ years",
      category: "Design",
    },
  ];

  const [selectedInternshipCategory, setSelectedInternshipCategory] =
    useState("");
  const [selectedJobCategory, setSelectedJobCategory] = useState("");

  const normalizedSelectedInternshipCategory = String(
    selectedInternshipCategory || ""
  )
    .trim()
    .toLowerCase();

  const filteredInternships = internships.filter((item: any) => {
    if (!normalizedSelectedInternshipCategory) return true;

    const itemCategory = String(item?.category || "")
      .trim()
      .toLowerCase();

    return itemCategory.includes(normalizedSelectedInternshipCategory);
  });



  const filteredJobs = jobs.filter(
    (item: any) => !selectedJobCategory || item.category === selectedJobCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* hero section */}
      <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t("homeTitle")}
        </h1>
        <p className="text-xl text-gray-600">{t("homeTrending")}</p>
      </div>
      {/* Swiper section */}
      <div className="mb-16">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop={true}
          speed={700}
          className="rounded-[20px] overflow-hidden shadow-lg"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
                <div
                  className={`relative overflow-hidden rounded-[24px] ${slide.bgColor} aspect-[16/9]`}
                >
                  <div className="absolute inset-0">
                    <Image
                      src={slide.image}
                      alt=""
                      fill
                      className="object-cover w-full h-full"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
                      priority={index === 0}
                    />
                  </div>
                </div>
            </SwiperSlide>

          ))}
        </Swiper>
      </div>

      {/* Internship section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t("homeLatestInternships")}
        </h2>

        <CategoryFilter
          label={t("homePopularCategories")}
          categories={[...current.categories]}
          selectedCategory={selectedInternshipCategory}
          onChange={setSelectedInternshipCategory}
        />

        <div className="flex overflow-x-auto gap-6 mb-6 pb-2">
          {isInternshipsLoading ? (
            <div className="text-gray-600">{t("loading") || "Loading..."}</div>
          ) : filteredInternships.length === 0 ? (
            <div className="text-gray-600">No internships available.</div>
          ) : (
            filteredInternships.map((internship: any) => {
              const internshipId = internship?._id;
              const internshipTitle = internship?.title || "Internship";
              const internshipCompany = internship?.company || "Company";
              const internshipLocation = internship?.location || "Location not specified";
              const internshipStipend = internship?.stipend || "Not disclosed";
              const internshipDuration =
                internship?.duration ||
                internship?.startDate ||
                internship?.numberOfOpening ||
                "Duration not specified";
              const internshipCategory = internship?.category || "Internship";

              return (
                <div
                  key={internshipId}
                  className="min-w-[320px] bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-blue-600">
                      <ArrowUpRight size={20} />
                      <span className="font-medium">{t("homeActivelyHiring")}</span>
                    </div>
                    <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                      {internship?.logo || internship?.image || internship?.companyLogo ? (
                        <Image
                          src={internship?.logo || internship?.image || internship?.companyLogo}
                          alt={internshipCompany}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Building2 size={24} className="text-gray-500" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    {internshipTitle}
                  </h3>
                  <p className="text-gray-500 mb-4">{internshipCompany}</p>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      <span>{internshipLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Banknote size={18} />
                      <span>{internshipStipend}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={18} />
                      <span>{internshipDuration}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                      {internshipCategory}
                    </span>
                    <Link
                      href={`/detailiternship/${internshipId}`}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      {t("homeViewDetails")}
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {internshipsError && (
          <div className="mb-4 text-sm text-red-600">{internshipsError}</div>
        )}
      </div>
      {/* Jobs grid   */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("homeLatestJobs")}</h2>

        <CategoryFilter
          label={t("homePopularCategories")}
          categories={[
            t("jobCategorySoftwareDevelopment"),

            t("jobCategoryRemote"),
            t("jobCategoryFullTime"),
            t("jobCategoryPartTime"),
            t("jobCategoryDataScience"),
            t("jobCategoryUIUX"),
            t("jobCategoryMarketing"),
            t("jobCategorySales"),
            t("jobCategoryHR"),
            t("jobCategoryFinance"),
          ]}
          selectedCategory={selectedJobCategory}
          onChange={setSelectedJobCategory}
        />

        <div className="flex overflow-x-auto gap-6 mb-16 pb-2">
          {filteredJobs.map((job: any) => (

            <div
              key={job._id}
              className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <ArrowUpRight size={20} />
                <span className="font-medium">{t("homeActivelyHiring")}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                {job.title}
              </h3>
              <p className="text-gray-500 mb-4">{job.company}</p>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote size={18} />
                  <span>{job.CTC}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{job.Experience}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                  Job
                </span>
                <Link
                href={`/detailjob/${job._id}`}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                  {t("homeViewDetails")}
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Stat Section  */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
