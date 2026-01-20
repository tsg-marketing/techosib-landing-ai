import { useState, useEffect } from "react";
import { saveUtmToCookies, getUtmFromCookies } from "@/utils/utm";
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
    carriageSpeed: string;
    weight: string;
    type: string;
  };
  images: string[];
  inStock?: boolean;
  videoUrl?: string;
}

// All 9 models
const models: Model[] = [
  {
    id: "ts3000mr-h",
    name: "TS3000MR-H",
    inStock: true,
    price: "300 000",
    description: "Каретка MR – механическая регулировка натяжения плёнки на каретке (без предварительного растяжения плёнки).",
    videoUrl: "https://rutube.ru/video/3d5b579103f00442bcbcf94e1a75a079/",
    features: [
      "Размеры паллет 500×1200 мм и 1000×1200 мм",
      "Высота паллет до 2400 мм",
      "Вес паллет до 2000 кг",
      "Привод кареткоповоротного стола – цепной",
      "10 пользовательских программ в памяти"
    ],
    specs: {
      voltage: "220V",
      power: "1.15 кВт",
      turntableSize: "1650 мм (диаметр)",
      maxLoad: "2000 кг",
      maxHeight: "2400 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      carriageSpeed: "0-4 м/мин",
      weight: "480 кг",
      type: "стационарный"
    },
    images: [
      "https://cdn.poehali.dev/files/e4d94967-8ee7-44a6-9587-a22100c9c4cf.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-1.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-2.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-3.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-4.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-5.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-6.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-7.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-10.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-11.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-12.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-18.jpg",
      "https://cdn.poehali.dev/files/TS-3000MR-H-19.jpg"
    ]
  },
  {
    id: "ts3000sps-h",
    name: "TS3000SPS-H",
    inStock: true,
    price: "350 000",
    description: "Моторизированная каретка SPS – предварительное растяжение плёнки – 250% (фиксированное), натяжение плёнки на паллете регулируется с панели управления.",
    videoUrl: "https://rutube.ru/video/36ca1c58ba9d91e41a902101aefb239a/",
    features: [
      "Размеры паллет 500×1200 мм и 1000×1200 мм",
      "Высота паллет до 2400 мм",
      "Вес паллет до 2000 кг",
      "Привод кареткоповоротного стола – цепной",
      "10 пользовательских программ в памяти"
    ],
    specs: {
      voltage: "220V",
      power: "1.5 кВт",
      turntableSize: "1650 мм (диаметр)",
      maxLoad: "2000 кг",
      maxHeight: "2400 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      carriageSpeed: "0-4 м/мин",
      weight: "500 кг",
      type: "стационарный"
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
    description: "Электромеханический прижим для фиксации нестабильного груза и предотвращения его смещения в процессе обмотки. Механическая регулировка натяжения плёнки.",
    features: [
      "Размеры паллет 500×1200 мм и 1000×1200 мм",
      "Высота паллет до 2400 мм",
      "Вес паллет до 2000 кг",
      "Привод кареткоповоротного стола – цепной",
      "10 пользовательских программ в памяти"
    ],
    specs: {
      voltage: "220V",
      power: "1.5 кВт",
      turntableSize: "1650 мм (диаметр)",
      maxLoad: "2000 кг",
      maxHeight: "2400 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      carriageSpeed: "0-4 м/мин",
      weight: "520 кг",
      type: "стационарный"
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
    description: "Электромеханический прижим для фиксации нестабильного груза и предотвращения его смещения в процессе обмотки. Предварительное растяжение плёнки – 250%.",
    videoUrl: "https://rutube.ru/video/99fd63779b6594febf9ef7f5d40b0dd4/",
    features: [
      "Размеры паллет 500×1200 мм и 1000×1200 мм",
      "Высота паллет до 2400 мм",
      "Вес паллет до 2000 кг",
      "Привод кареткоповоротного стола – цепной",
      "10 пользовательских программ в памяти"
    ],
    specs: {
      voltage: "220V",
      power: "1.89 кВт",
      turntableSize: "1650 мм (диаметр)",
      maxLoad: "2000 кг",
      maxHeight: "2400 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      carriageSpeed: "0-4 м/мин",
      weight: "540 кг",
      type: "стационарный"
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
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-11.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-12.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-13.jpg",
      "https://cdn.poehali.dev/files/TS-3000SPS-TP-14.jpg"
    ]
  },
  {
    id: "ts3000mr-mt",
    name: "TS3000MR-MT",
    inStock: false,
    price: "420 000",
    description: "Модель оснащена E-образным столом, который позволяет легко захватывать поддон с грузом без применения подъездной рамы. Механическая регулировка натяжения плёнки на каретке.",
    features: [
      "Размеры паллет 800×1200 мм и 1000×1200 мм",
      "Высота паллет до 2400 мм",
      "Вес паллет до 800 кг",
      "10 пользовательских программ в памяти",
      "Цикл упаковки по заданной высоте"
    ],
    specs: {
      voltage: "220V",
      power: "1.2 кВт",
      turntableSize: "1650 мм (диаметр)",
      maxLoad: "800 кг",
      maxHeight: "2400 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      carriageSpeed: "0-4 м/мин",
      weight: "580 кг",
      type: "стационарный"
    },
    images: ["https://cdn.poehali.dev/files/TS3000MR-MT.jpg"]
  },
  {
    id: "ts3000sps-mt",
    name: "TS3000SPS-MT",
    inStock: true,
    price: "470 000",
    description: "Модель оснащена E-образным столом, который позволяет легко захватывать поддон с грузом без применения подъездной рамы. Предварительное растяжение плёнки на каретке — 250%.",
    videoUrl: "https://rutube.ru/video/70daaca34940ea89ab0bc4578ad55d41/",
    features: [
      "Размеры паллет 800×1200 мм и 1000×1200 мм",
      "Высота паллет до 2400 мм",
      "Вес паллет до 800 кг",
      "10 пользовательских программ в памяти",
      "Цикл упаковки по заданной высоте"
    ],
    specs: {
      voltage: "220V",
      power: "1.5 кВт",
      turntableSize: "1650 мм (диаметр)",
      maxLoad: "800 кг",
      maxHeight: "2400 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      carriageSpeed: "0-4 м/мин",
      weight: "600 кг",
      type: "стационарный"
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
    description: "Модель оснащена E-образным столом, а также электромеханическим прижимом. Механическая регулировка натяжения плёнки на каретке.",
    features: [
      "Размеры паллет 800×1200 мм и 1000×1200 мм",
      "Высота паллет до 2400 мм",
      "Вес паллет до 800 кг",
      "10 пользовательских программ в памяти",
      "Цикл упаковки по заданной высоте"
    ],
    specs: {
      voltage: "220V",
      power: "1.5 кВт",
      turntableSize: "1650 мм (диаметр)",
      maxLoad: "800 кг",
      maxHeight: "2400 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      carriageSpeed: "0-4 м/мин",
      weight: "620 кг",
      type: "стационарный"
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
    description: "Модель оснащена E-образным столом, а также электромеханическим прижимом. Предварительное растяжение плёнки — 250%, идеальное решение для упаковки нестабильных грузов.",
    features: [
      "Размеры паллет 800×1200 мм и 1000×1200 мм",
      "Высота паллет до 2400 мм",
      "Вес паллет до 800 кг",
      "10 пользовательских программ в памяти",
      "Цикл упаковки по заданной высоте"
    ],
    specs: {
      voltage: "220V",
      power: "2.1 кВт",
      turntableSize: "1650 мм (диаметр)",
      maxLoad: "800 кг",
      maxHeight: "2400 мм",
      wrappingSpeed: "0-12 об/мин",
      turntableSpeed: "4-12 об/мин",
      carriageSpeed: "0-4 м/мин",
      weight: "640 кг",
      type: "стационарный"
    },
    images: ["https://cdn.poehali.dev/files/ts3000sps-mt-tp.jpg"]
  },
  {
    id: "robo-ms",
    name: "ROBO-MS",
    inStock: true,
    price: "По запросу",
    description: "Мобильный паллетообмотчик для упаковки грузов в любом месте склада или производства.",
    videoUrl: "https://rutube.ru/video/998b38f116a6ed24365f83277005a639/",
    features: [
      "Без ограничения по размерам паллет",
      "Без ограничения по весу паллет",
      "Высота паллет до 2400 мм",
      "Предварительное растяжение плёнки — 250%",
      "Два свинцово-кислотных АКБ 12V 110AH",
      "Время работы от аккумулятора до 8 ч"
    ],
    specs: {
      voltage: "АКБ",
      power: "0.95 кВт",
      turntableSize: "—",
      maxLoad: "—",
      maxHeight: "2400 мм",
      wrappingSpeed: "—",
      turntableSpeed: "—",
      carriageSpeed: "—",
      weight: "520 кг",
      type: "мобильный"
    },
    images: [
      "https://cdn.poehali.dev/files/6I8A7423 (2).jpg",
      "https://cdn.poehali.dev/files/6I8A7424 (2).jpg",
      "https://cdn.poehali.dev/files/6I8A7399.jpg",
      "https://cdn.poehali.dev/files/6I8A7397.jpg",
      "https://cdn.poehali.dev/files/6I8A7398.jpg",
      "https://cdn.poehali.dev/files/6I8A7413.jpg",
      "https://cdn.poehali.dev/files/6I8A7440.jpg",
      "https://cdn.poehali.dev/files/6I8A7422.jpg",
      "https://cdn.poehali.dev/files/6I8A7421.jpg",
      "https://cdn.poehali.dev/files/6I8A7430.jpg",
      "https://cdn.poehali.dev/files/6I8A7412.jpg",
      "https://cdn.poehali.dev/files/6I8A7409.jpg",
      "https://cdn.poehali.dev/files/6I8A7406.jpg",
      "https://cdn.poehali.dev/files/6I8A7404.jpg",
      "https://cdn.poehali.dev/files/6I8A7418.jpg",
      "https://cdn.poehali.dev/files/6I8A7402.jpg",
      "https://cdn.poehali.dev/files/6I8A7416.jpg",
      "https://cdn.poehali.dev/files/6I8A7417.jpg",
      "https://cdn.poehali.dev/files/6I8A7415.jpg",
      "https://cdn.poehali.dev/files/6I8A7435.jpg",
      "https://cdn.poehali.dev/files/6I8A7428.jpg",
      "https://cdn.poehali.dev/files/6I8A7436.jpg",
      "https://cdn.poehali.dev/files/6I8A7438.jpg",
      "https://cdn.poehali.dev/files/6I8A7439.jpg",
      "https://cdn.poehali.dev/files/6I8A7425.jpg",
      "https://cdn.poehali.dev/files/6I8A7426.jpg",
      "https://cdn.poehali.dev/files/6I8A7427.jpg"
    ]
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
    description: "Снижение расхода стретч-пленки от 30% до 50% по сравнению с ручной упаковкой и сокращение расходов на оплату труда"
  },
  {
    icon: "Zap",
    title: "Высокая производительность",
    description: "Упаковка одного паллета занимает 2-3 минуты"
  },
  {
    icon: "Shield",
    title: "Надежная защита груза",
    description: "Надежная защита груза при транспортировке"
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
    answer: "Выбор модели зависит от объемов производства, высоты паллет и требований к функционалу оборудования. Для небольших объемов 20-30 паллет в день подойдут базовые модели TS3000MR-H, для средних и крупных - модели TS3000SPS-H, позволяющие максимально снизить расход упаковочного материала. Для упаковки нестабильного груза, фиксации и предотвращения его смещения в процессе обмотки лучшим выбором будет модель с электромеханическим прижимом (TP). Включение цикла работы с прижимным устройством осуществляется с панели управления. E-образный стол модели (MT) позволяет легко закатывать рохлю с грузом без применения подъездной рампы. Это существенно экономит рабочее пространство склада, а так же при упаковке нестабильных грузов предотвращает их смещение (разваливание) при закатывании паллета с помощью наклонной рампы или подъеме паллета погрузчиком."
  },
  {
    question: "Какое напряжение питания требуется?",
    answer: "Все модели имеют стандартное подключение от сети 220V."
  },
  {
    question: "Входит ли доставка в стоимость?",
    answer: "Доставка рассчитывается отдельно в зависимости от региона."
  },
  {
    question: "Предоставляете ли вы гарантию?",
    answer: "Да, на все оборудование предоставляется гарантия 12 месяцев. Гарантия покрывает производственные дефекты и неисправности, возникшие при нормальной эксплуатации."
  },
  {
    question: "Нужна ли специальная подготовка для работы?",
    answer: "Нет, управление паллетообмотчиком интуитивно понятно. При доставке наш специалист проведет инструктаж и покажет все функции оборудования."
  },
  {
    question: "Какой расход стретч-пленки?",
    answer: "В зависимости от веса груза, типа паллеты (евро, стандарт) и оборотов средний расход пленки при машинной обмотке составляет 200–250 грамм. Модели с моторизированной кареткой (престрейчем) обеспечивают экономию пленки от 30% до 50% по сравнению с ручной обмоткой."
  },
  {
    question: "Как происходит техническое обслуживание?",
    answer: "Оборудование требует минимального обслуживания - регулярной чистки, проверки натяжения цепей и смазки движущихся частей раз в 3-6 месяцев. Мы предлагаем сервисные контракты на постгарантийное обслуживание."
  },
  {
    question: "Возможна ли рассрочка или лизинг?",
    answer: "Да, мы работаем с ведущими лизинговыми компаниями. Также возможна рассрочка платежа от производителя. Свяжитесь с нами для расчета индивидуальных условий."
  },
  {
    question: "Кто вы и где находитесь?",
    answer: "Компания Техно-Сиб основана в 2001 году. Мы специализируемся на поставках и сервисном обслуживании профессионального пищевого и фасовочно-упаковочного оборудования, а также обеспечении упаковочными и расходными материалами. Наши склады находятся в городах Москва и Новосибирск. Доставку оборудования мы делаем по всей России."
  }
];

export default function Index() {
  const { prices, minPrice, loading } = usePrices();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedModelForQuiz, setSelectedModelForQuiz] = useState("");
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [heroFormOpen, setHeroFormOpen] = useState(false);
  const [demoFormOpen, setDemoFormOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({
    palletSize: "",
    palletHeight: "",
    palletWeight: "",
    dailyVolume: "",
    machineType: ""
  });

  useEffect(() => {
    saveUtmToCookies();
  }, []);

  const getPrice = (modelName: string): string => {
    if (Object.keys(prices).length > 0 && prices[modelName]) {
      return prices[modelName];
    }
    return models.find(m => m.name === modelName)?.price || "по запросу";
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const name = formData.get('name') as string || '';
    const phone = formData.get('phone') as string || '';
    const email = formData.get('email') as string || '';
    const company = formData.get('company') as string || '';
    let comment = formData.get('comment') as string || '';
    
    let modelForRequest = selectedModel;
    
    if (quizStep === 5) {
      const quizInfo = `Результат подбора:<br>` +
        `Размер паллет: ${quizAnswers.palletSize}<br>` +
        `Высота паллет: ${quizAnswers.palletHeight}<br>` +
        `Вес паллет: ${quizAnswers.palletWeight}<br>` +
        `Объем в день: ${quizAnswers.dailyVolume}<br>` +
        `Тип оборудования: ${quizAnswers.machineType}`;
      
      if (selectedModelForQuiz) {
        comment = quizInfo + `<br>Рекомендованная модель: ${selectedModelForQuiz}` + (comment ? '<br><br>' + comment : '');
        modelForRequest = selectedModelForQuiz;
      } else {
        comment = quizInfo + (comment ? '<br><br>' + comment : '');
      }
    } else if (selectedModel) {
      comment = `Интересующая модель: ${selectedModel}${comment ? '<br><br>' + comment : ''}`;
    }
    
    if (demoFormOpen) {
      comment = `Запрос на просмотр в демозале${comment ? '<br><br>' + comment : ''}`;
    }
    
    const pageUrl = window.location.href;
    const utmData = getUtmFromCookies();
    
    const requestData = {
      name,
      phone,
      email,
      company,
      comment,
      productType: 'Паллетообмотчик',
      modelType: modelForRequest || '',
      url: pageUrl,
      ...utmData
    };
    
    try {
      const response = await fetch('/api/b24-send-lead.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert("Спасибо! Мы свяжемся с вами в ближайшее время.");
        setDialogOpen(false);
        setHeroFormOpen(false);
        setDemoFormOpen(false);
        if (quizStep === 5) {
          resetQuiz();
        }
        form.reset();
      } else {
        alert("Произошла ошибка при отправке. Пожалуйста, попробуйте позже или позвоните нам.");
      }
    } catch (error) {
      alert("Произошла ошибка при отправке. Пожалуйста, попробуйте позже или позвоните нам.");
      console.error('Form submission error:', error);
    }
  };

  const openModelDialog = (modelName: string) => {
    setSelectedModel(modelName);
    setDialogOpen(true);
  };

  const openVideoDialog = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
    setVideoDialogOpen(true);
  };

  const getRecommendedModel = () => {
    const { palletSize, palletHeight, palletWeight, dailyVolume, machineType } = quizAnswers;
    
    if (!palletSize || !palletHeight || !palletWeight || !dailyVolume || !machineType) {
      return models[0];
    }

    if (machineType === "mobile") {
      return models.find(m => m.id === "robo-ms") || models[0];
    }

    let recommendedModels = models.filter(m => m.specs.type === "стационарный");

    // Filter by pallet size and weight (MT models for 800kg)
    if (palletSize === "800x1200" || palletWeight === "800") {
      recommendedModels = recommendedModels.filter(m => m.id.includes("-mt"));
    } else {
      recommendedModels = recommendedModels.filter(m => !m.id.includes("-mt"));
    }

    // Filter by daily volume
    if (dailyVolume === "high" && recommendedModels.some(m => m.id.includes("sps"))) {
      recommendedModels = recommendedModels.filter(m => m.id.includes("sps"));
    } else if (dailyVolume === "low") {
      recommendedModels = recommendedModels.filter(m => m.id.includes("mr"));
    }

    return recommendedModels[0] || models[0];
  };

  const handleQuizComplete = () => {
    const recommended = getRecommendedModel();
    setSelectedModelForQuiz(recommended.name);
    setQuizStep(5);
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({ palletSize: "", palletHeight: "", palletWeight: "", dailyVolume: "", machineType: "" });
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
        className="relative pt-24 pb-16 min-h-[600px] md:min-h-[700px] flex items-center bg-contain bg-right bg-no-repeat"
        style={{ 
          backgroundImage: 'url(https://cdn.poehali.dev/files/Паллетник_ТС.jpg)',
          backgroundSize: '40%',
          backgroundPosition: 'right 10% center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-4">
              <span className="font-serif">Паллетообмотчики</span>
            </h1>
            <img src="https://cdn.poehali.dev/files/ЛОГО_ТСг.jpg" alt="ТЕХНОСИБ" className="h-12 md:h-16 lg:h-20 mb-6" />
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 font-semibold mb-4">
              Надежное оборудование по доступной цене
            </p>
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-8">
              От {minPrice} руб
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-white text-lg py-6"
                onClick={() => setHeroFormOpen(true)}
              >
                Получить предложение
              </Button>
              <Button 
                size="lg" 
                className="bg-primary/20 hover:bg-primary/30 text-gray-900 border border-primary/30 text-lg py-6"
                onClick={() => setDemoFormOpen(true)}
              >
                Посмотреть товар в демозале
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg py-6"
                onClick={() => scrollToSection('models')}
              >
                Посмотреть модели
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="advantages" className="py-16 bg-white">
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
                  <h3 className="text-2xl font-semibold">{advantage.title}</h3>
                  <p className="text-lg text-muted-foreground">{advantage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Gallery Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Видеообзоры оборудования
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Смотрите, как работают наши паллетообмотчики в реальных условиях
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.filter(m => m.videoUrl).map((model) => (
              <Card key={model.id} className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" onClick={() => openVideoDialog(model.videoUrl!)}>
                <div className="relative aspect-video bg-gray-900">
                  <img 
                    src={model.images[0]} 
                    alt={model.name}
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                    <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl">
                      <Icon name="Play" size={32} className="text-white ml-1" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold mb-2">{model.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{model.description}</p>
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
                  <CardTitle className="text-2xl text-gray-900">{model.name}</CardTitle>
                  <CardDescription className="text-3xl font-bold text-secondary">
                    {getPrice(model.name)} руб
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-base text-gray-700 mb-4">{model.description}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {model.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-base text-gray-700">
                        <Icon name="Check" size={18} className="text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-2">
                    {model.videoUrl && (
                      <Button 
                        className="w-full text-base py-5 bg-red-600 hover:bg-red-700 text-white" 
                        onClick={() => openVideoDialog(model.videoUrl!)}
                      >
                        <Icon name="Play" size={18} className="mr-2" />
                        Посмотреть видео
                      </Button>
                    )}
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-white text-lg py-6" 
                      onClick={() => openModelDialog(model.name)}
                    >
                      Получить КП
                    </Button>
                  </div>
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
                  <th className="px-2 py-3 text-left font-semibold text-sm">Характеристика</th>
                  {models.map((model) => (
                    <th key={model.id} className="px-2 py-3 text-center font-semibold text-sm min-w-[100px]">
                      {model.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium text-gray-900 text-sm">Цена</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-2 py-2 text-center text-gray-900 font-bold text-xs">
                      {getPrice(model.name)} руб
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium text-gray-900 text-sm">Напряжение</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-2 py-2 text-center text-gray-900 text-xs">
                      {model.specs.voltage}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium text-gray-900 text-sm">Мощность</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-2 py-2 text-center text-gray-900 text-xs">
                      {model.specs.power}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium text-gray-900 text-sm">Размер стола</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-2 py-2 text-center text-gray-900 text-xs">
                      {model.specs.turntableSize}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium text-gray-900 text-sm">Макс. нагрузка</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-2 py-2 text-center text-gray-900 text-xs">
                      {model.specs.maxLoad}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium text-gray-900 text-sm">Макс. высота</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-2 py-2 text-center text-gray-900 text-xs">
                      {model.specs.maxHeight}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium text-gray-900 text-sm">Скорость стола</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-2 py-2 text-center text-gray-900 text-xs">
                      {model.specs.turntableSpeed}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium text-gray-900 text-sm">Скорость каретки</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-2 py-2 text-center text-gray-900 text-xs">
                      {model.specs.carriageSpeed}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium text-gray-900 text-sm">Вес</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-2 py-2 text-center text-gray-900 text-xs">
                      {model.specs.weight}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-2 py-2 font-medium text-gray-900 text-sm">Тип</td>
                  {models.map((model) => (
                    <td key={model.id} className="px-2 py-2 text-center text-gray-900 text-xs">
                      {model.specs.type}
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
                      <Label className="text-lg mb-4 block">Размеры паллет</Label>
                      <RadioGroup value={quizAnswers.palletSize} onValueChange={(value) => setQuizAnswers({ ...quizAnswers, palletSize: value })}>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="800x1200" id="size-1" />
                          <Label htmlFor="size-1" className="flex-1 cursor-pointer">800×1200 мм</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="1000x1200" id="size-2" />
                          <Label htmlFor="size-2" className="flex-1 cursor-pointer">1000×1200 мм</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="other" id="size-3" />
                          <Label htmlFor="size-3" className="flex-1 cursor-pointer">Другое</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <Button 
                      className="w-full bg-secondary hover:bg-secondary/90" 
                      onClick={() => setQuizStep(1)}
                      disabled={!quizAnswers.palletSize}
                    >
                      Далее
                    </Button>
                  </div>
                )}

                {quizStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg mb-4 block">Высота паллет</Label>
                      <RadioGroup value={quizAnswers.palletHeight} onValueChange={(value) => setQuizAnswers({ ...quizAnswers, palletHeight: value })}>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="2000" id="height-1" />
                          <Label htmlFor="height-1" className="flex-1 cursor-pointer">До 2000 мм</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="2400" id="height-2" />
                          <Label htmlFor="height-2" className="flex-1 cursor-pointer">До 2400 мм</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="other" id="height-3" />
                          <Label htmlFor="height-3" className="flex-1 cursor-pointer">Другое</Label>
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
                        disabled={!quizAnswers.palletHeight}
                      >
                        Далее
                      </Button>
                    </div>
                  </div>
                )}

                {quizStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg mb-4 block">Вес паллет</Label>
                      <RadioGroup value={quizAnswers.palletWeight} onValueChange={(value) => setQuizAnswers({ ...quizAnswers, palletWeight: value })}>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="800" id="weight-1" />
                          <Label htmlFor="weight-1" className="flex-1 cursor-pointer">До 800 кг</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="2000" id="weight-2" />
                          <Label htmlFor="weight-2" className="flex-1 cursor-pointer">До 2000 кг</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="more" id="weight-3" />
                          <Label htmlFor="weight-3" className="flex-1 cursor-pointer">Более 2000 кг</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setQuizStep(1)}>
                        Назад
                      </Button>
                      <Button 
                        className="flex-1 bg-secondary hover:bg-secondary/90" 
                        onClick={() => setQuizStep(3)}
                        disabled={!quizAnswers.palletWeight}
                      >
                        Далее
                      </Button>
                    </div>
                  </div>
                )}

                {quizStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg mb-4 block">Количество паллет в день</Label>
                      <RadioGroup value={quizAnswers.dailyVolume} onValueChange={(value) => setQuizAnswers({ ...quizAnswers, dailyVolume: value })}>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="low" id="volume-1" />
                          <Label htmlFor="volume-1" className="flex-1 cursor-pointer">До 50</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="medium" id="volume-2" />
                          <Label htmlFor="volume-2" className="flex-1 cursor-pointer">До 100</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="high" id="volume-3" />
                          <Label htmlFor="volume-3" className="flex-1 cursor-pointer">Более 100</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setQuizStep(2)}>
                        Назад
                      </Button>
                      <Button 
                        className="flex-1 bg-secondary hover:bg-secondary/90" 
                        onClick={() => setQuizStep(4)}
                        disabled={!quizAnswers.dailyVolume}
                      >
                        Далее
                      </Button>
                    </div>
                  </div>
                )}

                {quizStep === 4 && !selectedModelForQuiz && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg mb-4 block">Тип паллетообмотчика</Label>
                      <RadioGroup value={quizAnswers.machineType} onValueChange={(value) => setQuizAnswers({ ...quizAnswers, machineType: value })}>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="stationary" id="type-1" />
                          <Label htmlFor="type-1" className="flex-1 cursor-pointer">Стационарный</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="mobile" id="type-2" />
                          <Label htmlFor="type-2" className="flex-1 cursor-pointer">Мобильный</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setQuizStep(3)}>
                        Назад
                      </Button>
                      <Button 
                        className="flex-1 bg-secondary hover:bg-secondary/90" 
                        onClick={() => setQuizStep(5)}
                        disabled={!quizAnswers.machineType}
                      >
                        Далее
                      </Button>
                    </div>
                  </div>
                )}

                {quizStep === 5 && (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="quiz-name">Имя *</Label>
                      <Input id="quiz-name" name="name" type="text" placeholder="Ваше имя" required />
                    </div>
                    <div>
                      <Label htmlFor="quiz-phone">Телефон *</Label>
                      <Input id="quiz-phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required />
                    </div>
                    <div>
                      <Label htmlFor="quiz-email">Email</Label>
                      <Input id="quiz-email" name="email" type="email" placeholder="your@email.com" />
                    </div>
                    <div>
                      <Label htmlFor="quiz-company">Компания</Label>
                      <Input id="quiz-company" name="company" type="text" placeholder="Название компании" />
                    </div>
                    <div>
                      <Label htmlFor="quiz-comment">Комментарий</Label>
                      <Textarea id="quiz-comment" name="comment" placeholder="Дополнительная информация" />
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox id="quiz-consent" required />
                      <Label htmlFor="quiz-consent" className="text-xs text-muted-foreground cursor-pointer">
                        Согласен на обработку персональных данных
                      </Label>
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={resetQuiz}>
                        Назад
                      </Button>
                      <Button type="submit" className="flex-1 bg-secondary hover:bg-secondary/90">
                        Оставить заявку
                      </Button>
                    </div>
                  </form>
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
                  <h3 className="text-xl font-semibold">{useCase.title}</h3>
                  <p className="text-base text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
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
                  <a href="tel:88005057238" className="text-2xl font-bold block hover:text-secondary transition-colors">
                    8-800-505-72-38
                  </a>
                  <p className="text-sm text-white/80">Пн-Пт: 9:00 - 18:00</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white backdrop-blur">
                <CardContent className="p-6 space-y-3">
                  <Icon name="Mail" size={32} className="mx-auto" />
                  <h3 className="text-xl font-semibold">Напишите нам</h3>
                  <a href="mailto:pallet@t-sib.ru" className="text-xl font-semibold block hover:text-secondary transition-colors">
                    pallet@t-sib.ru
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

      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Видео о модели</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <iframe
              src={selectedVideo.replace('/video/', '/play/embed/')}
              frameBorder="0"
              allow="clipboard-write; autoplay"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Form Dialog - Получить предложение */}
      <Dialog open={heroFormOpen} onOpenChange={setHeroFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Получить коммерческое предложение</DialogTitle>
            <DialogDescription>Заполните форму и мы отправим КП на указанный номер</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="hero-form-name">Имя *</Label>
              <Input id="hero-form-name" name="name" type="text" placeholder="Ваше имя" required />
            </div>
            <div>
              <Label htmlFor="hero-form-phone">Телефон *</Label>
              <Input id="hero-form-phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required />
            </div>
            <div>
              <Label htmlFor="hero-form-email">Email</Label>
              <Input id="hero-form-email" name="email" type="email" placeholder="your@email.com" />
            </div>
            <div>
              <Label htmlFor="hero-form-company">Компания</Label>
              <Input id="hero-form-company" name="company" type="text" placeholder="Название компании" />
            </div>
            <div>
              <Label htmlFor="hero-form-comment">Комментарий</Label>
              <Textarea id="hero-form-comment" name="comment" placeholder="Дополнительная информация" />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="hero-form-consent" required />
              <Label htmlFor="hero-form-consent" className="text-xs text-muted-foreground cursor-pointer">
                Согласен на обработку персональных данных
              </Label>
            </div>
            <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90">
              Отправить
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Demo Form Dialog - Посмотреть товар в демозале */}
      <Dialog open={demoFormOpen} onOpenChange={setDemoFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Посмотреть товар в демозале</DialogTitle>
            <DialogDescription>Оставьте контакты и мы свяжемся с вами для записи на просмотр</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="demo-form-name">Имя *</Label>
              <Input id="demo-form-name" name="name" type="text" placeholder="Ваше имя" required />
            </div>
            <div>
              <Label htmlFor="demo-form-phone">Телефон *</Label>
              <Input id="demo-form-phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required />
            </div>
            <div>
              <Label htmlFor="demo-form-email">Email</Label>
              <Input id="demo-form-email" name="email" type="email" placeholder="your@email.com" />
            </div>
            <div>
              <Label htmlFor="demo-form-company">Компания</Label>
              <Input id="demo-form-company" name="company" type="text" placeholder="Название компании" />
            </div>
            <div>
              <Label htmlFor="demo-form-comment">Комментарий</Label>
              <Textarea id="demo-form-comment" name="comment" placeholder="Дополнительная информация" />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="demo-form-consent" required />
              <Label htmlFor="demo-form-consent" className="text-xs text-muted-foreground cursor-pointer">
                Согласен на обработку персональных данных
              </Label>
            </div>
            <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90">
              Отправить
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <img src="https://cdn.poehali.dev/files/ЛОГО_ТСг.jpg" alt="ТЕХНОСИБ" className="h-16 mx-auto" />
            <p className="text-gray-400">Надежное упаковочное оборудование для вашего бизнеса</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-gray-400">
              <button onClick={() => scrollToSection('models')} className="hover:text-white transition-colors">Модели</button>
              <button onClick={() => scrollToSection('advantages')} className="hover:text-white transition-colors">Преимущества</button>
              <button onClick={() => scrollToSection('service')} className="hover:text-white transition-colors">Сервис</button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">FAQ</button>
              <button onClick={() => scrollToSection('contacts')} className="hover:text-white transition-colors">Контакты</button>
            </div>
            <div className="text-sm text-gray-500 pt-4">
              2026 ТЕХНОСИБ. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}