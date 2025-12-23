import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ImageCarousel from '@/components/ImageCarousel';

const modelImages: Record<string, string[]> = {
  'TS3000MR-H': [
    'https://cdn.poehali.dev/files/TS-3000MR-H.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-1.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-2.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-3.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-4.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-5.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-6.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-7.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-8.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-9.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-10.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-11.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-12.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-13.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-14.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-15.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-16.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-17.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-18.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-19.jpg',
    'https://cdn.poehali.dev/files/TS-3000MR-H-20.jpg'
  ],
  'TS3000SPS-H': [],
  'TS3000MR-TP': [],
  'TS3000SPS-TP': [],
  'TS3000MR-MT': [],
  'TS3000SPS-MT': [],
  'TS3000MR-MT-TP': [],
  'TS3000SPS-MT-TP': []
};

const models = [
  {
    name: 'TS3000MR-H',
    weight: '550 кг',
    power: '1,15 MR',
    carriage: 'Механическая',
    prestretch: 'Нет',
    construction: 'Обычный',
    capacity: '2000 кг',
    programs: '10'
  },
  {
    name: 'TS3000SPS-H',
    weight: '550 кг',
    power: '1,5 SP',
    carriage: 'Моторизир.',
    prestretch: '250% фикс',
    construction: 'Обычный',
    capacity: '2000 кг',
    programs: '10'
  },
  {
    name: 'TS3000MR-TP',
    weight: '550 кг',
    power: '1,15 MR',
    carriage: 'Механическая',
    prestretch: 'Нет',
    construction: 'Обычный',
    capacity: '2000 кг',
    programs: '10'
  },
  {
    name: 'TS3000SPS-TP',
    weight: '550 кг',
    power: '1,89 SP',
    carriage: 'Моторизир.',
    prestretch: '250% фикс',
    construction: 'Обычный',
    capacity: '2000 кг',
    programs: '10'
  },
  {
    name: 'TS3000MR-MT',
    weight: '550 кг',
    power: '1,2 MR',
    carriage: 'Механическая',
    prestretch: 'Нет',
    construction: 'E-образн.',
    capacity: '800 кг',
    programs: '10'
  },
  {
    name: 'TS3000SPS-MT',
    weight: '550 кг',
    power: '1,5 SP',
    carriage: 'Моторизир.',
    prestretch: '250% фикс',
    construction: 'E-образн.',
    capacity: '800 кг',
    programs: '10'
  },
  {
    name: 'TS3000MR-MT-TP',
    weight: '550 кг',
    power: '1,5 MR',
    carriage: 'Механическая',
    prestretch: 'Нет',
    construction: 'E-образн.',
    capacity: '800 кг',
    programs: '10'
  },
  {
    name: 'TS3000SPS-MT-TP',
    weight: '550 кг',
    power: '2,1 SP',
    carriage: 'Моторизир.',
    prestretch: '250% фикс',
    construction: 'E-образн.',
    capacity: '800 кг',
    programs: '10'
  }
];

const fullSpecs = [
  { name: 'TS3000MR-H', weight: 550, power: '1,15 MR', carriage: 'Механическая', prestretch: 'Нет', tension: 'Мех.регулир.', construction: 'Обычный', mechTension: '—', platform: '—', capacity: 2000, pallet: '1000×1200', height: 2400, programs: 10, control: 'Сенсорный', filmBreak: 'Да', stopSensor: 'Да', dimensions: '2535×1652×2208', power_supply: '1Ø, 50Гц' },
  { name: 'TS3000SPS-H', weight: 550, power: '1,5 SP', carriage: 'Моторизир.', prestretch: '250% фикс', tension: 'С панели', construction: 'Обычный', mechTension: '—', platform: '—', capacity: 2000, pallet: '1000×1200', height: 2400, programs: 10, control: 'Сенсорный', filmBreak: 'Да', stopSensor: 'Да', dimensions: '2535×1652×2208', power_supply: '1Ø, 50Гц' },
  { name: 'TS3000MR-TP', weight: 550, power: '1,15 MR', carriage: 'Механическая', prestretch: 'Нет', tension: 'Мех.регулир.', construction: 'Обычный', mechTension: '600', platform: '2000', capacity: 2000, pallet: '1000×1200', height: 2400, programs: 10, control: 'Сенсорный', filmBreak: 'Да', stopSensor: 'Да', dimensions: '2535×1652×2208', power_supply: '1Ø, 50Гц' },
  { name: 'TS3000SPS-TP', weight: 550, power: '1,89 SP', carriage: 'Моторизир.', prestretch: '250% фикс', tension: 'С панели', construction: 'Обычный', mechTension: '600', platform: '2000', capacity: 2000, pallet: '1000×1200', height: 2400, programs: 10, control: 'Сенсорный', filmBreak: 'Да', stopSensor: 'Да', dimensions: '2535×1652×2208', power_supply: '1Ø, 50Гц' },
  { name: 'TS3000MR-MT', weight: 550, power: '1,2 MR', carriage: 'Механическая', prestretch: 'Нет', tension: 'Мех.регулир.', construction: 'E-образн.', mechTension: '—', platform: '—', capacity: 800, pallet: '1000×1200', height: 2400, programs: 10, control: 'Сенсорный', filmBreak: 'Да', stopSensor: 'Да', dimensions: '2555×1706×2208', power_supply: '1Ø, 50Гц' },
  { name: 'TS3000SPS-MT', weight: 550, power: '1,5 SP', carriage: 'Моторизир.', prestretch: '250% фикс', tension: 'С панели', construction: 'E-образн.', mechTension: '—', platform: '—', capacity: 800, pallet: '1000×1200', height: 2400, programs: 10, control: 'Сенсорный', filmBreak: 'Да', stopSensor: 'Да', dimensions: '2555×1706×2208', power_supply: '1Ø, 50Гц' },
  { name: 'TS3000MR-MT-TP', weight: 550, power: '1,5 MR', carriage: 'Механическая', prestretch: 'Нет', tension: 'Мех.регулир.', construction: 'E-образн.', mechTension: '600', platform: '800', capacity: 800, pallet: '1000×1200', height: 2400, programs: 10, control: 'Сенсорный', filmBreak: 'Да', stopSensor: 'Да', dimensions: '2535×1706×2208', power_supply: '1Ø, 50Гц' },
  { name: 'TS3000SPS-MT-TP', weight: 550, power: '2,1 SP', carriage: 'Моторизир.', prestretch: '250% фикс', tension: 'С панели', construction: 'E-образн.', mechTension: '600', platform: '800', capacity: 800, pallet: '1000×1200', height: 2400, programs: 10, control: 'Сенсорный', filmBreak: 'Да', stopSensor: 'Да', dimensions: '2535×1707×2208', power_supply: '1Ø, 50Гц' }
];

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const { toast } = useToast();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Заявка отправлена!",
      description: "Мы свяжемся с вами в ближайшее время.",
    });
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">ТЕХНОСИБ</div>
            
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('models')} className="text-sm font-semibold hover:text-primary transition-colors">Модели</button>
              <button onClick={() => scrollToSection('advantages')} className="text-sm font-semibold hover:text-primary transition-colors">Преимущества</button>
              <button onClick={() => scrollToSection('specs')} className="text-sm font-semibold hover:text-primary transition-colors">Характеристики</button>
              <button onClick={() => scrollToSection('service')} className="text-sm font-semibold hover:text-primary transition-colors">Сервис</button>
              <button onClick={() => scrollToSection('faq')} className="text-sm font-semibold hover:text-primary transition-colors">FAQ</button>
              <button onClick={() => scrollToSection('contacts')} className="text-sm font-semibold hover:text-primary transition-colors">Контакты</button>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <a href="tel:+7" className="text-lg font-semibold text-primary hover:text-secondary transition-colors">+7 (___) ___-__-__</a>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary hover:bg-secondary/90">Получить КП</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Получить коммерческое предложение</DialogTitle>
                    <DialogDescription>Заполните форму и мы отправим КП на указанный номер</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input id="phone" type="tel" placeholder="+7 (___) ___-__-__" required />
                    </div>
                    <div>
                      <Label htmlFor="name">Имя</Label>
                      <Input id="name" type="text" placeholder="Ваше имя" />
                    </div>
                    <div>
                      <Label htmlFor="comment">Комментарий</Label>
                      <Textarea id="comment" placeholder="Дополнительная информация" />
                    </div>
                    {selectedModel && (
                      <div className="text-sm text-muted-foreground">
                        Модель: <span className="font-semibold">{selectedModel}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Checkbox id="consent" required />
                      <Label htmlFor="consent" className="text-xs text-muted-foreground cursor-pointer">
                        Согласен на обработку персональных данных
                      </Label>
                    </div>
                    <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90">Отправить заявку</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in">
              <button onClick={() => scrollToSection('models')} className="block w-full text-left py-2 text-sm font-semibold hover:text-primary transition-colors">Модели</button>
              <button onClick={() => scrollToSection('advantages')} className="block w-full text-left py-2 text-sm font-semibold hover:text-primary transition-colors">Преимущества</button>
              <button onClick={() => scrollToSection('specs')} className="block w-full text-left py-2 text-sm font-semibold hover:text-primary transition-colors">Характеристики</button>
              <button onClick={() => scrollToSection('service')} className="block w-full text-left py-2 text-sm font-semibold hover:text-primary transition-colors">Сервис</button>
              <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 text-sm font-semibold hover:text-primary transition-colors">FAQ</button>
              <button onClick={() => scrollToSection('contacts')} className="block w-full text-left py-2 text-sm font-semibold hover:text-primary transition-colors">Контакты</button>
              <a href="tel:+7" className="block py-2 text-lg font-semibold text-primary">+7 (___) ___-__-__</a>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-secondary hover:bg-secondary/90">Получить КП</Button>
                </DialogTrigger>
              </Dialog>
            </nav>
          )}
        </div>
      </header>

      <main className="pt-20">
        <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20 md:py-32 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Паллетообмотчики ТЕХНОСИБ — надежное оборудование по доступной цене. <span className="text-secondary">От 300 тыс.руб</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                8 моделей под склад и производство. Подберем под ваш груз и пленку
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
                <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                  <Icon name="Package" className="text-primary" size={24} />
                  <span className="text-sm font-semibold">8 моделей оборудования</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                  <Icon name="Zap" className="text-secondary" size={24} />
                  <span className="text-sm font-semibold">Функции как у дорогих</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                  <Icon name="Shield" className="text-primary" size={24} />
                  <span className="text-sm font-semibold">Надежная обмотка</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                  <Icon name="Headphones" className="text-secondary" size={24} />
                  <span className="text-sm font-semibold">Сервис и поддержка</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => scrollToSection('selection')} size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                  Подобрать модель
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="text-lg px-8 border-secondary text-secondary hover:bg-secondary hover:text-white">
                      Запросить цену
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </div>
        </section>

        <section id="use-cases" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">Кому подходит</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { icon: 'Warehouse', title: 'Складская логистика', desc: 'Надежная упаковка грузов перед отправкой' },
                { icon: 'Factory', title: 'Производство', desc: 'Автоматизация процесса обмотки паллет' },
                { icon: 'Truck', title: 'Транспортные компании', desc: 'Быстрая подготовка к отправке' },
                { icon: 'ShoppingCart', title: 'Торговые сети', desc: 'Упаковка товаров для дистрибуции' },
                { icon: 'Box', title: 'Упаковочные цеха', desc: 'Профессиональная обмотка любых грузов' },
                { icon: 'Building2', title: 'Дистрибуция', desc: 'Защита продукции при транспортировке' }
              ].map((item, idx) => (
                <Card key={idx} className="hover-scale cursor-pointer border-2 hover:border-primary transition-all">
                  <CardHeader>
                    <Icon name={item.icon as any} className="text-primary mb-3" size={40} />
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="text-base">{item.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button onClick={() => scrollToSection('selection')} size="lg" className="bg-secondary hover:bg-secondary/90">
                Получить подбор
              </Button>
            </div>
          </div>
        </section>

        <section id="advantages" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">Почему ТЕХНОСИБ</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { icon: 'DollarSign', title: 'Доступная цена', desc: 'От 300 тыс.руб — оптимальное соотношение цены и качества' },
                { icon: 'Settings', title: 'Надежная конструкция', desc: 'Качественные комплектующие и сборка' },
                { icon: 'FilmIcon', title: 'Пленка не рвется', desc: 'Надежное натяжение пленки при обмотке' },
                { icon: 'Gauge', title: 'Простое управление', desc: 'Интуитивная сенсорная панель, 10 программ' },
                { icon: 'ListChecks', title: '8 моделей на выбор', desc: 'Подберем оборудование под ваши задачи' },
                { icon: 'Wrench', title: 'Сервис и запчасти', desc: 'Пусконаладка, гарантия, консультации' }
              ].map((item, idx) => (
                <div key={idx} className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 hover-scale">
                  <Icon name={item.icon as any} className="text-secondary mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90">Получить КП</Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </section>

        <section id="models" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">8 моделей ТЕХНОСИБ</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {models.map((model, idx) => (
                <Card key={idx} className="hover-scale border-2 hover:border-primary transition-all overflow-hidden">
                  <ImageCarousel 
                    images={modelImages[model.name] || []} 
                    alt={model.name}
                  />
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">{model.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Вес:</span>
                      <span className="font-semibold">{model.weight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Мощность:</span>
                      <span className="font-semibold">{model.power}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Каретка:</span>
                      <span className="font-semibold">{model.carriage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Предрастяж.:</span>
                      <span className="font-semibold">{model.prestretch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Конструкция:</span>
                      <span className="font-semibold">{model.construction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Г/п:</span>
                      <span className="font-semibold">{model.capacity}</span>
                    </div>
                    <Button 
                      onClick={() => {
                        setSelectedModel(model.name);
                        setDialogOpen(true);
                      }} 
                      className="w-full mt-4 bg-secondary hover:bg-secondary/90"
                    >
                      Запросить цену
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="specs" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">Характеристики и сравнение моделей ТЕХНОСИБ</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold">Модель</th>
                    <th className="p-3 text-left text-sm font-semibold">Вес, кг</th>
                    <th className="p-3 text-left text-sm font-semibold">Мощность</th>
                    <th className="p-3 text-left text-sm font-semibold">Каретка</th>
                    <th className="p-3 text-left text-sm font-semibold">Предрастяж.</th>
                    <th className="p-3 text-left text-sm font-semibold">Натяжение</th>
                    <th className="p-3 text-left text-sm font-semibold">Конструкция</th>
                    <th className="p-3 text-left text-sm font-semibold">Г/п, кг</th>
                    <th className="p-3 text-left text-sm font-semibold">Управление</th>
                    <th className="p-3 text-left text-sm font-semibold">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {fullSpecs.map((spec, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-semibold text-primary">{spec.name}</td>
                      <td className="p-3">{spec.weight}</td>
                      <td className="p-3">{spec.power}</td>
                      <td className="p-3">{spec.carriage}</td>
                      <td className="p-3">{spec.prestretch}</td>
                      <td className="p-3">{spec.tension}</td>
                      <td className="p-3">{spec.construction}</td>
                      <td className="p-3">{spec.capacity}</td>
                      <td className="p-3">{spec.control}</td>
                      <td className="p-3">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedModel(spec.name);
                            setDialogOpen(true);
                          }}
                          className="bg-secondary hover:bg-secondary/90 text-xs"
                        >
                          Цена
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="selection" className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-6">Подбор оборудования</h2>
              <p className="text-center text-muted-foreground mb-10">Заполните форму и мы подберем оптимальную модель под ваши задачи</p>
              
              <Card className="border-2">
                <CardContent className="pt-6">
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="cargo">Тип груза</Label>
                      <Input id="cargo" placeholder="Например: строительные материалы" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pallet-size">Размер паллет, мм</Label>
                        <Input id="pallet-size" placeholder="1000×1200" />
                      </div>
                      <div>
                        <Label htmlFor="height">Высота груза, мм</Label>
                        <Input id="height" type="number" placeholder="2400" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight">Вес груза, кг</Label>
                        <Input id="weight" type="number" placeholder="800" />
                      </div>
                      <div>
                        <Label htmlFor="film">Тип пленки (опционально)</Label>
                        <Input id="film" placeholder="Стрейч, термоусадка..." />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone-selection">Телефон *</Label>
                      <Input id="phone-selection" type="tel" placeholder="+7 (___) ___-__-__" required />
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox id="consent-selection" required />
                      <Label htmlFor="consent-selection" className="text-xs text-muted-foreground cursor-pointer">
                        Согласен на обработку персональных данных
                      </Label>
                    </div>
                    <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-lg py-6">
                      Получить подбор
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="service" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">Сервис и поддержка</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { icon: 'Search', title: 'Подбор оборудования', desc: 'Поможем выбрать модель под ваши задачи' },
                { icon: 'Truck', title: 'Поставка', desc: 'Доставка по всей России' },
                { icon: 'Play', title: 'Пусконаладка', desc: 'Установка и настройка оборудования' },
                { icon: 'ShieldCheck', title: 'Гарантия', desc: 'Гарантийное обслуживание' },
                { icon: 'MessageCircle', title: 'Консультации', desc: 'Техническая поддержка 24/7' },
                { icon: 'Package', title: 'Запчасти', desc: 'Оригинальные комплектующие в наличии' }
              ].map((item, idx) => (
                <Card key={idx} className="text-center hover-scale border-2 hover:border-primary transition-all">
                  <CardContent className="pt-6">
                    <Icon name={item.icon as any} className="text-primary mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-10">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90">Запросить условия</Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">Частые вопросы</h2>
            <Accordion type="single" collapsible className="max-w-3xl mx-auto space-y-4">
              <AccordionItem value="item-1" className="bg-white px-6 rounded-lg border-2">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Как выбрать подходящую модель?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Выбор зависит от веса груза, размера паллет и типа пленки. Мы поможем подобрать оптимальную модель — просто заполните форму подбора или свяжитесь с нами по телефону.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="bg-white px-6 rounded-lg border-2">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Почему пленка не рвется при натяжении?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Наши паллетообмотчики оснащены системой контроля натяжения пленки. Механическая или электронная регулировка обеспечивает оптимальное усилие без обрыва пленки.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="bg-white px-6 rounded-lg border-2">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Какие дополнительные опции доступны?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Доступны модели с предрастяжением пленки 250%, моторизованными каретками, верхним прижимом груза и E-образной конструкцией для особо хрупких грузов.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="bg-white px-6 rounded-lg border-2">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Какой срок поставки оборудования?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Стандартные модели поставляются в течение 2-4 недель. Конфигурации под заказ — до 6 недель. Точные сроки уточняйте у менеджеров.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="bg-white px-6 rounded-lg border-2">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Какая гарантия на оборудование?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  На все модели предоставляется гарантия 12 месяцев с момента пусконаладки. Также доступно расширенное гарантийное обслуживание.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6" className="bg-white px-6 rounded-lg border-2">
                <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                  Как проходит техническое обслуживание?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Рекомендуется проводить плановое ТО раз в 6 месяцев. Наши специалисты выполнят диагностику, замену расходников и настройку оборудования. Выезд возможен по всей России.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <section id="contacts" className="py-20 bg-gradient-to-br from-primary via-primary/90 to-secondary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Готовы начать?</h2>
              <p className="text-xl mb-10 opacity-90">Получите коммерческое предложение прямо сейчас</p>
              
              <Card className="border-0 shadow-2xl">
                <CardContent className="pt-6">
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="final-phone">Телефон *</Label>
                        <Input id="final-phone" type="tel" placeholder="+7 (___) ___-__-__" required />
                      </div>
                      <div>
                        <Label htmlFor="final-name">Имя</Label>
                        <Input id="final-name" type="text" placeholder="Ваше имя" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="final-comment">Комментарий</Label>
                      <Textarea id="final-comment" placeholder="Опишите ваши задачи" />
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox id="consent-final" required />
                      <Label htmlFor="consent-final" className="text-xs text-muted-foreground cursor-pointer">
                        Согласен на обработку персональных данных
                      </Label>
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-lg py-6">
                      Получить КП
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-12 space-y-4 text-lg">
                <div className="flex items-center justify-center gap-3">
                  <Icon name="Phone" size={24} />
                  <a href="tel:+7" className="hover:underline">+7 (___) ___-__-__</a>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Icon name="Mail" size={24} />
                  <a href="mailto:info@technosib.ru" className="hover:underline">info@technosib.ru</a>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Icon name="MapPin" size={24} />
                  <span>Россия, работаем по всей стране</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-foreground text-white py-6">
          <div className="container mx-auto px-4 text-center text-sm opacity-75">
            <p>© 2024 ТЕХНОСИБ. Все права защищены.</p>
            <p className="mt-2">
              <a href="#" className="hover:underline">Политика конфиденциальности</a>
            </p>
          </div>
        </footer>
      </main>

      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 shadow-2xl rounded-full px-8">
              Получить КП
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  );
}