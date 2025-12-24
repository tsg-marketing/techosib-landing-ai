import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Icon from "@/components/ui/icon";
import ImageCarousel from "@/components/ImageCarousel";
import Header from "@/components/sections/Header";
import MachineCollage from "@/components/MachineCollage";
import { usePrices } from "@/hooks/usePrices";

// Model data structure
interface Model {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  specs: {
    voltage: string;
    power: string;
    turntableSize: string;
    maxLoad: string;
    maxHeight: string;
    wrappingSpeed: string;
    turntableSpeed: string;
    weight: string;
  };
  images: string[];
  inStock?: boolean;
}

// All 8 models
const models: Model[] = [
  {
    id: "ts3000mr-h",
    name: "TS3000MR-H",
    inStock: true,
    price: "300 000",
    description: "Базовая модель с ручным креплением пленки. Идеальна для небольших складов и производств.",
    features: [
      "Ручное крепление пленки",
      "Простота в эксплуатации",
      "Надежная конструкция",
      "Экономичное решение"
    ],
    specs: {
      voltage: "220V / 380V",
      power: "1.5 кВт",
      turntableSize: "1500x1500 мм",
      maxLoad: "2000 кг",
      maxHeight: "2000 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      weight: "480 кг"
    },
    images: [
      "https://cdn.poehali.dev/files/TS-3000MR-H.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-1.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-2.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-3.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-4.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-5.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-6.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-7.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-8.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-9.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-10.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-11.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-12.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-13.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-14.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-15.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-16.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-17.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-18.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-19.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-20.jpg"
    ]
  },
  {
    id: "ts3000sps-h",
    name: "TS3000SPS-H",
    inStock: true,
    price: "350 000",
    description: "Модель с автоматической подачей и обрезкой пленки. Повышенная производительность.",
    features: [
      "Автоматическая подача пленки",
      "Автоматическая обрезка",
      "Повышенная скорость работы",
      "Минимальное участие оператора"
    ],
    specs: {
      voltage: "220V / 380V",
      power: "1.5 кВт",
      turntableSize: "1500x1500 мм",
      maxLoad: "2000 кг",
      maxHeight: "2000 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      weight: "500 кг"
    },
    images: [
      "https://cdn.poehali.dev/files/TS-3000SPS-H.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-H-2.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-H-3.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-H-4.jpg"
    ]
  },
  {
    id: "ts3000mr-tp",
    name: "TS3000MR-TP",
    price: "380 000",
    description: "Модель с верхним прижимом груза для дополнительной фиксации нестабильных паллет.",
    features: [
      "Верхний прижим груза",
      "Стабилизация паллеты",
      "Ручное крепление пленки",
      "Подходит для сложных грузов"
    ],
    specs: {
      voltage: "220V / 380V",
      power: "1.8 кВт",
      turntableSize: "1500x1500 мм",
      maxLoad: "2000 кг",
      maxHeight: "2200 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      weight: "520 кг"
    },
    images: [
      "https://cdn.poehali.dev/files/TS3000MR-TP.jpg"
    ],
    inStock: false
  },
  {
    id: "ts3000sps-tp",
    name: "TS3000SPS-TP",
    inStock: true,
    price: "430 000",
    description: "Автоматическая модель с верхним прижимом. Максимальная надежность упаковки.",
    features: [
      "Автоматическая подача и обрезка",
      "Верхний прижим груза",
      "Полная автоматизация",
      "Максимальная надежность"
    ],
    specs: {
      voltage: "220V / 380V",
      power: "1.8 кВт",
      turntableSize: "1500x1500 мм",
      maxLoad: "2000 кг",
      maxHeight: "2200 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      weight: "540 кг"
    },
    images: [
      "https://cdn.poehali.dev/files/TS-3000SPS-TP.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-1.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-2.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-3.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-4.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-5.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-6.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-7.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-8.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-9.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-10.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-11.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-12.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-13.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-14.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-15.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-16.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-17.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-18.jpg"
    ]
  },
  {
    id: "ts3000mr-mt",
    name: "TS3000MR-MT",
    inStock: false,
    price: "420 000",
    description: "Модель с увеличенной мачтой для упаковки высоких паллет до 3000 мм.",
    features: [
      "Высота обмотки до 3000 мм",
      "Усиленная конструкция",
      "Ручное крепление пленки",
      "Для высоких грузов"
    ],
    specs: {
      voltage: "220V / 380V",
      power: "1.8 кВт",
      turntableSize: "1500x1500 мм",
      maxLoad: "2000 кг",
      maxHeight: "3000 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      weight: "580 кг"
    },
    images: ["https://cdn.poehali.dev/files/TS3000MR-MT.jpg"]
  },
  {
    id: "ts3000sps-mt",
    name: "TS3000SPS-MT",
    inStock: true,
    price: "470 000",
    description: "Автоматическая модель с увеличенной мачтой. Для высоких грузов с полной автоматизацией.",
    features: [
      "Автоматическая подача и обрезка",
      "Высота обмотки до 3000 мм",
      "Высокая производительность",
      "Усиленная конструкция"
    ],
    specs: {
      voltage: "220V / 380V",
      power: "1.8 кВт",
      turntableSize: "1500x1500 мм",
      maxLoad: "2000 кг",
      maxHeight: "3000 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      weight: "600 кг"
    },
    images: [
      "https://cdn.poehali.dev/files/TS3000SPS-MT.jpg",
      "https://cdn.poehali.dev/files/TS3000SPS-MT-1.jpg",
      "https://cdn.poehali.dev/files/TS3000SPS-MT-2.jpg",
      "https://cdn.poehali.dev/files/TS3000SPS-MT-3.jpg",
      "https://cdn.poehali.dev/files/TS3000SPS-MT-4.jpg",
      "https://cdn.poehali.dev/files/TS3000SPS-MT-5.jpg",
      "https://cdn.poehali.dev/files/TS3000SPS-MT-6.jpg",
      "https://cdn.poehali.dev/files/TS3000SPS-MT-7.jpg",
      "https://cdn.poehali.dev/files/TS3000SPS-MT-8.jpg",
      "https://cdn.poehali.dev/files/TS3000SPS-MT-9.jpg",
      "https://cdn.poehali.dev/files/TS3000SPS-MT-10.jpg"
    ]
  },
  {
    id: "ts3000mr-mt-tp",
    name: "TS3000MR-MT-TP",
    inStock: false,
    price: "500 000",
    description: "Максимальная комплектация с увеличенной мачтой и верхним прижимом.",
    features: [
      "Высота обмотки до 3000 мм",
      "Верхний прижим груза",
      "Универсальное решение",
      "Для сложных грузов"
    ],
    specs: {
      voltage: "220V / 380V",
      power: "2.0 кВт",
      turntableSize: "1500x1500 мм",
      maxLoad: "2000 кг",
      maxHeight: "3000 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      weight: "620 кг"
    },
    images: [
      "https://cdn.poehali.dev/files/TS3000MR-MT-TP.png"
    ]
  },
  {
    id: "ts3000sps-mt-tp",
    name: "TS3000SPS-MT-TP",
    inStock: false,
    price: "550 000",
    description: "Топовая модель с полной автоматизацией, увеличенной мачтой и верхним прижимом.",
    features: [
      "Полная автоматизация процесса",
      "Высота обмотки до 3000 мм",
      "Верхний прижим груза",
      "Максимальная надежность и производительность"
    ],
    specs: {
      voltage: "220V / 380V",
      power: "2.0 кВт",
      turntableSize: "1500x1500 мм",
      maxLoad: "2000 кг",
      maxHeight: "3000 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      weight: "640 кг"
    },
    images: ["https://cdn.poehali.dev/files/1.jpg"]
  }
];

// Use cases data
const useCases = [
  {
    icon: "Warehouse",
    title: "Складские комплексы",
    description: "Автоматизация упаковки грузов перед отправкой"
  },
  {
    icon: "Factory",
    title: "Производственные предприятия",
    description: "Упаковка готовой продукции на паллетах"
  },
  {
    icon: "Truck",
    title: "Логистические центры",
    description: "Подготовка грузов к транспортировке"
  },
  {
    icon: "ShoppingCart",
    title: "Торговые сети",
    description: "Упаковка товаров для межскладских перемещений"
  }
];

// Advantages data
const advantages = [
  {
    icon: "DollarSign",
    title: "Экономия средств",
    description: "Снижение расхода стретч-пленки до 30% по сравнению с ручной упаковкой"
  },
  {
    icon: "Zap",
    title: "Высокая производительность",
    description: "Упаковка одного паллета занимает 60-90 секунд"
  },
  {
    icon: "Shield",
    title: "Надежная защита груза",
    description: "Равномерное натяжение пленки обеспечивает качественную фиксацию"
  },
  {
    icon: "Settings",
    title: "Простота эксплуатации",
    description: "Интуитивное управление, не требует специальной подготовки"
  },
  {
    icon: "Award",
    title: "Качество и надежность",
    description: "Проверенное оборудование с гарантией 12 месяцев"
  },
  {
    icon: "Wrench",
    title: "Легкое обслуживание",
    description: "Минимальные требования к техническому обслуживанию"
  }
];

// FAQ data
const faqItems = [
  {
    question: "Какая модель подойдет для моего бизнеса?",
    answer: "Выбор модели зависит от объемов производства, высоты паллет и требований к автоматизации. Для небольших объемов подойдут базовые модели MR-H, для средних и крупных - модели с автоматикой SPS. Если у вас высокие паллеты (выше 2м), выбирайте модели с маркировкой MT. Для нестабильных грузов рекомендуем модели с верхним прижимом (TP)."
  },
  {
    question: "Какое напряжение питания требуется?",
    answer: "Все модели работают от стандартной сети 220V или 380V (трехфазное). При заказе укажите доступное у вас напряжение, мы настроим оборудование соответствующим образом."
  },
  {
    question: "Входит ли доставка в стоимость?",
    answer: "Доставка рассчитывается отдельно в зависимости от региона. По Москве и области доставка обычно составляет 3-5 тысяч рублей. В регионы - по тарифам транспортных компаний."
  },
  {
    question: "Предоставляете ли вы гарантию?",
    answer: "Да, на все оборудование предоставляется гарантия 12 месяцев. Гарантия покрывает производственные дефекты и неисправности, возникшие при нормальной эксплуатации."
  },
  {
    question: "Нужна ли специальная подготовка для работы?",
    answer: "Нет, управление паллетообмотчиком интуитивно понятно. При доставке наш специалист проведет инструктаж и покажет все функции оборудования. Также прилагается подробная инструкция на русском языке."
  },
  {
    question: "Какой расход стретч-пленки?",
    answer: "Расход пленки зависит от размеров паллеты, количества слоев и степени натяжения. В среднем на один паллет уходит 150-300 метров пленки. Автоматические модели обеспечивают экономию пленки до 30% по сравнению с ручной обмоткой."
  },
  {
    question: "Как происходит техническое обслуживание?",
    answer: "Оборудование требует минимального обслуживания - регулярной чистки, проверки натяжения цепей и смазки движущихся частей раз в 3-6 месяцев. Мы предлагаем сервисные контракты на постгарантийное обслуживание."
  },
  {
    question: "Возможна ли рассрочка или лизинг?",
    answer: "Да, мы работаем с ведущими лизинговыми компаниями. Также возможна рассрочка платежа от производителя. Свяжитесь с нами для расчета индивидуальных условий."
  }
];

export default function Index() {
  const { prices, minPrice } = usePrices();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedModelForQuiz, setSelectedModelForQuiz] = useState("");
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({
    volume: "",
    height: "",
    automation: ""
  });

  const getPrice = (modelName: string): string => {
    return prices[modelName] || models.find(m => m.name === modelName)?.price || "по запросу";
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Спасибо! Мы свяжемся с вами в ближайшее время.");
    setDialogOpen(false);
  };

  const openModelDialog = (modelName: string) => {
    setSelectedModel(modelName);
    setDialogOpen(true);
  };

  const getRecommendedModel = () => {
    const { volume, height, automation } = quizAnswers;
    
    if (!volume || !height || !automation) {
      return models[0];
    }

    let recommendedModels = models;

    // Filter by height
    if (height === "low") {
      recommendedModels = recommendedModels.filter(m => !m.id.includes("-mt"));
    } else {
      recommendedModels = recommendedModels.filter(m => m.id.includes("-mt"));
    }

    // Filter by automation
    if (automation === "auto") {
      recommendedModels = recommendedModels.filter(m => m.id.includes("sps"));
    } else {
      recommendedModels = recommendedModels.filter(m => m.id.includes("mr"));
    }

    // Recommend TP for high volume
    if (volume === "high" && recommendedModels.some(m => m.id.includes("-tp"))) {
      recommendedModels = recommendedModels.filter(m => m.id.includes("-tp"));
    }

    return recommendedModels[0] || models[0];
  };

  const handleQuizComplete = () => {
    const recommended = getRecommendedModel();
    setSelectedModelForQuiz(recommended.name);
    setQuizStep(4);
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({ volume: "", height: "", automation: "" });
    setSelectedModelForQuiz("");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        selectedModel={selectedModel}
        scrollToSection={scrollToSection}
        handleFormSubmit={handleFormSubmit}
      />

      {/* Hero Section */}
      <section 
        className="relative pt-24 pb-8 bg-contain bg-center bg-no-repeat min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center"
        style={{ backgroundImage: 'url(https://cdn.poehali.dev/files/баннер.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/90"></div>
        <div className="container mx-auto px-4 relative z-10 w-full">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-tight">
              Паллетообмотчики <span className="inline-block">
                <img src="https://cdn.poehali.dev/files/ЛОГО_ТСг.jpg" alt="ТЕХНОСИБ" className="inline-block h-12 md:h-16 lg:h-20 xl:h-24 align-middle" />
              </span>
            </h1>
            <p className="text-2xl md:text-3xl lg:text-4xl text-gray-700 font-semibold">
              Надежное оборудование по доступной цене
            </p>
            <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary">
              От {minPrice} руб
            </p>
            <div className="flex flex-wrap gap-6 pt-6 justify-center">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-xl px-10 py-6" onClick={() => scrollToSection('models')}>
                <Icon name="Package" size={24} className="mr-2" />
                Выбрать модель
              </Button>
              <Button size="lg" variant="outline" className="text-xl px-10 py-6" onClick={() => setDialogOpen(true)}>
                <Icon name="Phone" size={24} className="mr-2" />
                Получить КП
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Где применяются паллетообмотчики
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, idx) => (
              <Card key={idx} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Icon name={useCase.icon as any} size={32} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="advantages" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Преимущества оборудования ТЕХНОСИБ
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((advantage, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={advantage.icon as any} size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{advantage.title}</h3>
                  <p className="text-muted-foreground">{advantage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section id="models" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Модели паллетообмотчиков
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Выберите оптимальную модель для вашего бизнеса. Все модели производятся на современном оборудовании с контролем качества на каждом этапе.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {models.map((model) => (
              <Card key={model.id} className="hover:shadow-xl transition-shadow flex flex-col">
                <ImageCarousel images={model.images} alt={model.name} inStock={model.inStock} />
                <CardHeader>
                  <CardTitle className="text-xl">{model.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-secondary">
                    {getPrice(model.name)} руб
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {model.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Icon name="Check" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-secondary hover:bg-secondary/90" 
                    onClick={() => openModelDialog(model.name)}
                  >
                    Получить КП
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specs Comparison Table */}
      <section id="specs" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Сравнительная таблица характеристик
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Характеристика</th>
                  {models.map((model) => (
                    <th key={model.id} className="px-4 py-3 text-center font-semibold min-w-[140px]">
                      {model.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">Цена</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-4 py-3 text-center text-secondary font-bold">
                      {getPrice(model.name)} руб
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">Напряжение</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-4 py-3 text-center">
                      {model.specs.voltage}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">Мощность</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-4 py-3 text-center">
                      {model.specs.power}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">Размер поворотного стола</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-4 py-3 text-center">
                      {model.specs.turntableSize}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">Макс. нагрузка</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-4 py-3 text-center">
                      {model.specs.maxLoad}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">Макс. высота обмотки</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-4 py-3 text-center font-semibold">
                      {model.specs.maxHeight}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">Скорость обмотки</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-4 py-3 text-center">
                      {model.specs.wrappingSpeed}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">Скорость вращения стола</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-4 py-3 text-center">
                      {model.specs.turntableSpeed}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">Вес оборудования</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-4 py-3 text-center">
                      {model.specs.weight}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Selection Quiz Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Подбор оборудования</CardTitle>
                <CardDescription className="text-center">
                  Ответьте на несколько вопросов, и мы порекомендуем оптимальную модель
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quizStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg mb-4 block">Какой объем упаковки планируете?</Label>
                      <RadioGroup value={quizAnswers.volume} onValueChange={(value) => setQuizAnswers({ ...quizAnswers, volume: value })}>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="low" id="low" />
                          <Label htmlFor="low" className="flex-1 cursor-pointer">До 20 паллет в день</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="medium" id="medium" />
                          <Label htmlFor="medium" className="flex-1 cursor-pointer">20-50 паллет в день</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="high" id="high" />
                          <Label htmlFor="high" className="flex-1 cursor-pointer">Более 50 паллет в день</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <Button 
                      className="w-full bg-secondary hover:bg-secondary/90" 
                      onClick={() => setQuizStep(1)}
                      disabled={!quizAnswers.volume}
                    >
                      Далее
                    </Button>
                  </div>
                )}

                {quizStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg mb-4 block">Какая высота ваших паллет?</Label>
                      <RadioGroup value={quizAnswers.height} onValueChange={(value) => setQuizAnswers({ ...quizAnswers, height: value })}>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="low" id="height-low" />
                          <Label htmlFor="height-low" className="flex-1 cursor-pointer">До 2 метров</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="high" id="height-high" />
                          <Label htmlFor="height-high" className="flex-1 cursor-pointer">До 3 метров</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setQuizStep(0)}>
                        Назад
                      </Button>
                      <Button 
                        className="flex-1 bg-secondary hover:bg-secondary/90" 
                        onClick={() => setQuizStep(2)}
                        disabled={!quizAnswers.height}
                      >
                        Далее
                      </Button>
                    </div>
                  </div>
                )}

                {quizStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg mb-4 block">Требуется ли автоматизация?</Label>
                      <RadioGroup value={quizAnswers.automation} onValueChange={(value) => setQuizAnswers({ ...quizAnswers, automation: value })}>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="manual" id="manual" />
                          <Label htmlFor="manual" className="flex-1 cursor-pointer">
                            <div>
                              <div className="font-semibold">Ручное крепление</div>
                              <div className="text-sm text-muted-foreground">Экономичный вариант</div>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="auto" id="auto" />
                          <Label htmlFor="auto" className="flex-1 cursor-pointer">
                            <div>
                              <div className="font-semibold">Автоматическая подача и обрезка</div>
                              <div className="text-sm text-muted-foreground">Повышенная производительность</div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setQuizStep(1)}>
                        Назад
                      </Button>
                      <Button 
                        className="flex-1 bg-secondary hover:bg-secondary/90" 
                        onClick={handleQuizComplete}
                        disabled={!quizAnswers.automation}
                      >
                        Получить результат
                      </Button>
                    </div>
                  </div>
                )}

                {quizStep === 4 && selectedModelForQuiz && (
                  <div className="space-y-6 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Icon name="CheckCircle" size={48} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Рекомендуем модель</h3>
                      <p className="text-3xl font-bold text-primary mb-4">{selectedModelForQuiz}</p>
                      <p className="text-muted-foreground mb-6">
                        {models.find(m => m.name === selectedModelForQuiz)?.description}
                      </p>
                      <div className="text-2xl font-bold text-secondary mb-6">
                        {getPrice(selectedModelForQuiz)} руб
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={resetQuiz}>
                        Пройти заново
                      </Button>
                      <Button 
                        className="flex-1 bg-secondary hover:bg-secondary/90" 
                        onClick={() => openModelDialog(selectedModelForQuiz)}
                      >
                        Получить КП
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Section */}
      <section id="service" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Сервис и поддержка
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Icon name="Truck" size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Доставка и монтаж</h3>
                <p className="text-muted-foreground">
                  Доставляем по всей России. Монтаж и пусконаладка выполняются нашими специалистами
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Icon name="GraduationCap" size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Обучение персонала</h3>
                <p className="text-muted-foreground">
                  Проводим инструктаж и обучение ваших сотрудников работе с оборудованием
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Icon name="Wrench" size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Гарантийное обслуживание</h3>
                <p className="text-muted-foreground">
                  12 месяцев гарантии. Быстрое реагирование на заявки и наличие запчастей на складе
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Часто задаваемые вопросы
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA / Contacts Section */}
      <section id="contacts" className="py-16 bg-gradient-to-b from-primary to-primary/90 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Готовы оптимизировать процесс упаковки?
            </h2>
            <p className="text-xl text-white/90">
              Свяжитесь с нами для консультации и расчета стоимости оборудования
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20 text-white backdrop-blur">
                <CardContent className="p-6 space-y-3">
                  <Icon name="Phone" size={32} className="mx-auto" />
                  <h3 className="text-xl font-semibold">Позвоните нам</h3>
                  <a href="tel:+7" className="text-2xl font-bold block hover:text-secondary transition-colors">
                    +7 (___) ___-__-__
                  </a>
                  <p className="text-sm text-white/80">Пн-Пт: 9:00 - 18:00</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white backdrop-blur">
                <CardContent className="p-6 space-y-3">
                  <Icon name="Mail" size={32} className="mx-auto" />
                  <h3 className="text-xl font-semibold">Напишите нам</h3>
                  <a href="mailto:info@technosib.ru" className="text-xl font-semibold block hover:text-secondary transition-colors">
                    info@technosib.ru
                  </a>
                  <p className="text-sm text-white/80">Ответим в течение часа</p>
                </CardContent>
              </Card>
            </div>
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-white text-lg px-12"
              onClick={() => setDialogOpen(true)}
            >
              Получить коммерческое предложение
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-primary">ТЕХНОСИБ</div>
            <p className="text-gray-400">Надежное упаковочное оборудование для вашего бизнеса</p>
            <div className="flex justify-center gap-8 text-sm text-gray-400">
              <button onClick={() => scrollToSection('models')} className="hover:text-white transition-colors">Модели</button>
              <button onClick={() => scrollToSection('advantages')} className="hover:text-white transition-colors">Преимущества</button>
              <button onClick={() => scrollToSection('service')} className="hover:text-white transition-colors">Сервис</button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">FAQ</button>
              <button onClick={() => scrollToSection('contacts')} className="hover:text-white transition-colors">Контакты</button>
            </div>
            <div className="text-sm text-gray-500 pt-4">
              2025 ТЕХНОСИБ. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}