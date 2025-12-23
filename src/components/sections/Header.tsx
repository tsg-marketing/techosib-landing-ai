import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  selectedModel: string;
  scrollToSection: (id: string) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
}

export default function Header({
  mobileMenuOpen,
  setMobileMenuOpen,
  dialogOpen,
  setDialogOpen,
  selectedModel,
  scrollToSection,
  handleFormSubmit
}: HeaderProps) {
  return (
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
  );
}
