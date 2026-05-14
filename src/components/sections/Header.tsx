import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useCart } from '@/hooks/useCart';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  selectedModel: string;
  scrollToSection: (id: string) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export default function Header({
  mobileMenuOpen,
  setMobileMenuOpen,
  dialogOpen,
  setDialogOpen,
  selectedModel,
  scrollToSection,
  handleFormSubmit,
  isSubmitting = false
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart();
  const cartCount = items.length;

  const brandLinks: { label: string; slug: string }[] = [
    { label: 'Техносиб', slug: 'tehnosib' },
    { label: 'Robopac', slug: 'robopac' },
    { label: 'Hualian', slug: 'hualian' },
  ];

  const goToBrand = (slug: string) => {
    const newHash = `#brand-${slug}`;
    if (location.pathname !== '/') {
      navigate(`/${newHash}`);
      return;
    }
    if (window.location.hash === newHash) {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      window.location.hash = newHash;
    }
    setMobileMenuOpen(false);
  };

  const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    
    const cleanValue = value.replace(/[^\d+]/g, '');
    
    if (cleanValue.startsWith('+7')) {
      const limitedValue = cleanValue.slice(0, 12);
      e.currentTarget.value = limitedValue;
    } else if (cleanValue.startsWith('+')) {
      const limitedValue = cleanValue.slice(0, 13);
      e.currentTarget.value = limitedValue;
    } else {
      const limitedValue = cleanValue.slice(0, 11);
      e.currentTarget.value = limitedValue;
    }
  };
  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://cdn.poehali.dev/files/ЛОГО_ТСг.jpg" alt="ТЕХНОСИБ" className="h-8" />
          </div>
          
          <nav className="hidden md:flex items-center gap-5">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-base font-semibold hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1 outline-none">
                Паллетообмотчики
                <Icon name="ChevronDown" size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[180px]">
                {brandLinks.map((b) => (
                  <DropdownMenuItem
                    key={b.slug}
                    onClick={() => goToBrand(b.slug)}
                    className="cursor-pointer text-base font-medium notranslate"
                    translate="no"
                  >
                    <span className="notranslate" translate="no">{b.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button onClick={() => scrollToSection('advantages')} className="text-base font-semibold hover:text-primary transition-colors whitespace-nowrap">Преимущества</button>
            <button onClick={() => scrollToSection('service')} className="text-base font-semibold hover:text-primary transition-colors whitespace-nowrap">Сервис</button>
            <button onClick={() => scrollToSection('faq')} className="text-base font-semibold hover:text-primary transition-colors whitespace-nowrap">FAQ</button>
            <button onClick={() => scrollToSection('about')} className="text-base font-semibold hover:text-primary transition-colors whitespace-nowrap">О нас</button>
            <button onClick={() => scrollToSection('contacts')} className="text-base font-semibold hover:text-primary transition-colors whitespace-nowrap">Контакты</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="tel:88005057238" className="text-lg font-semibold text-blue-900 hover:text-secondary transition-colors" onClick={() => {
              if (typeof window !== 'undefined' && (window as any).ym) {
                (window as any).ym(106348259, 'reachGoal', 'click_phone');
              }
            }}>8-800-505-72-38</a>
            <div className="flex flex-col gap-1">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary hover:bg-secondary/80 shadow-lg">Оставить заявку</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Получить коммерческое предложение</DialogTitle>
                    <DialogDescription>Заполните форму и мы отправим КП на указанный номер</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" onInput={handlePhoneInput} required />
                    </div>
                    <div>
                      <Label htmlFor="name">Имя</Label>
                      <Input id="name" name="name" type="text" placeholder="Ваше имя" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="your@email.com" />
                    </div>
                    {selectedModel && (
                      <div className="text-sm text-muted-foreground">
                        Модель: <span className="font-semibold">{selectedModel}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Checkbox id="consent" required />
                      <Label htmlFor="consent" className="text-xs text-muted-foreground cursor-pointer">
                        Отправляя форму, я соглашаюсь с <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">политикой обработки персональных данных</a> и даю <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">согласие на обработку персональных данных</a>.
                      </Label>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-secondary hover:bg-secondary/90">
                      {isSubmitting ? (
                        <>
                          <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        'Отправить заявку'
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" className="relative justify-center" onClick={() => navigate('/cart')}>
                <Icon name="ShoppingCart" size={15} className="mr-1.5" />
                Смотреть корзину
                {cartCount > 0 && (
                  <span className="ml-1.5 bg-secondary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in">
            <div>
              <div className="py-2 text-base font-semibold text-primary">Паллетообмотчики</div>
              <div className="pl-4 space-y-2">
                {brandLinks.map((b) => (
                  <button
                    key={b.slug}
                    onClick={() => goToBrand(b.slug)}
                    className="block w-full text-left py-1.5 text-sm font-medium hover:text-primary transition-colors notranslate"
                    translate="no"
                  >
                    <span className="notranslate" translate="no">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => scrollToSection('advantages')} className="block w-full text-left py-2 text-base font-semibold hover:text-primary transition-colors">Преимущества</button>
            <button onClick={() => scrollToSection('service')} className="block w-full text-left py-2 text-base font-semibold hover:text-primary transition-colors">Сервис</button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 text-base font-semibold hover:text-primary transition-colors">FAQ</button>
            <button onClick={() => scrollToSection('about')} className="block w-full text-left py-2 text-base font-semibold hover:text-primary transition-colors">О нас</button>
            <button onClick={() => scrollToSection('contacts')} className="block w-full text-left py-2 text-base font-semibold hover:text-primary transition-colors">Контакты</button>
            <a href="tel:88005057238" className="block py-2 text-lg font-semibold text-blue-900" onClick={() => {
              if (typeof window !== 'undefined' && (window as any).ym) {
                (window as any).ym(106348259, 'reachGoal', 'click_phone');
              }
            }}>8-800-505-72-38</a>
            <Button variant="outline" className="w-full relative" onClick={() => { navigate('/cart'); setMobileMenuOpen(false); }}>
              <Icon name="ShoppingCart" size={18} className="mr-2" />
              Смотреть корзину
              {cartCount > 0 && (
                <span className="ml-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-secondary hover:bg-secondary/80 shadow-lg">Оставить заявку</Button>
              </DialogTrigger>
            </Dialog>
          </nav>
        )}
      </div>
    </header>
  );
}