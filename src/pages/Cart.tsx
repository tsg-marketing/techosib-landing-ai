import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { saveUtmToCookies, getUtmFromCookies } from "@/utils/utm";

type YM = (id: number, goal: string, target: string) => void;

export default function Cart() {
  const { items, clearCart, total, removeItem } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatPrice = (n: number) =>
    n > 0 ? n.toLocaleString("ru-RU") + " руб" : "по запросу";

  const trackGoal = (goal: string) => {
    const w = window as unknown as { ym?: YM };
    if (w.ym) w.ym(106348259, "reachGoal", goal);
  };

  const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const clean = value.replace(/[^\d+]/g, "");
    if (clean.startsWith("+7")) e.currentTarget.value = clean.slice(0, 12);
    else if (clean.startsWith("+")) e.currentTarget.value = clean.slice(0, 13);
    else e.currentTarget.value = clean.slice(0, 11);
  };

  const submitToApi = async (payload: Record<string, string>) => {
    const response = await fetch("/api/b24-send-lead.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json() as Promise<{ success: boolean }>;
  };

  const handleHeaderFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    saveUtmToCookies();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    try {
      const result = await submitToApi({
        name: (fd.get("name") as string) || "",
        phone: (fd.get("phone") as string) || "",
        email: (fd.get("email") as string) || "",
        company: "",
        comment: "",
        productType: "Паллетообмотчик",
        modelType: "",
        url: window.location.href,
        ...getUtmFromCookies(),
      });
      if (result.success) {
        trackGoal("form_sent");
        setDialogOpen(false);
        form.reset();
      } else {
        alert("Произошла ошибка при отправке. Пожалуйста, попробуйте позже или позвоните нам.");
      }
    } catch {
      alert("Произошла ошибка при отправке. Пожалуйста, попробуйте позже или позвоните нам.");
    }
  };

  const handleCartFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    saveUtmToCookies();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const modelList = items.map((i) => `${i.name} — ${formatPrice(i.price)}`).join(", ");
    try {
      const result = await submitToApi({
        name: (fd.get("name") as string) || "",
        phone: (fd.get("phone") as string) || "",
        email: "",
        company: "",
        comment: `Заказ из корзины: ${modelList}. Итого: ${formatPrice(total)}`,
        productType: "Паллетообмотчик",
        modelType: items.map((i) => i.name).join(", "),
        url: window.location.href,
        ...getUtmFromCookies(),
      });
      if (result.success) {
        trackGoal("form_sent");
        setSubmitted(true);
        clearCart();
        form.reset();
      } else {
        alert("Произошла ошибка при отправке. Пожалуйста, попробуйте позже или позвоните нам.");
      }
    } catch {
      alert("Произошла ошибка при отправке. Пожалуйста, попробуйте позже или позвоните нам.");
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { label: "Модели", anchor: "models" },
    { label: "Преимущества", anchor: "advantages" },
    { label: "Характеристики", anchor: "specs" },
    { label: "Сервис", anchor: "service" },
    { label: "FAQ", anchor: "faq" },
    { label: "О нас", anchor: "about" },
    { label: "Контакты", anchor: "contacts" },
  ];

  const goToSection = (anchor: string) => {
    navigate(`/#${anchor}`);
    setMobileMenuOpen(false);
  };

  const consentText = (
    <Label className="text-xs text-muted-foreground cursor-pointer">
      Отправляя форму, я соглашаюсь с{" "}
      <a href="https://t-sib.ru/assets/politika_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        политикой обработки персональных данных
      </a>{" "}
      и даю{" "}
      <a href="https://t-sib.ru/assets/soglasie_t-sib16.05.25.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        согласие на обработку персональных данных
      </a>
      .
    </Label>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-3">
              <img src="https://cdn.poehali.dev/files/ЛОГО_ТСг.jpg" alt="ТЕХНОСИБ" className="h-8" />
            </button>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button key={item.anchor} onClick={() => goToSection(item.anchor)} className="text-base font-semibold hover:text-primary transition-colors">
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <a href="tel:88005057238" className="text-lg font-semibold text-blue-900 hover:text-secondary transition-colors" onClick={() => trackGoal("click_phone")}>
                8-800-505-72-38
              </a>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary hover:bg-secondary/80 shadow-lg">Оставить заявку</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Получить коммерческое предложение</DialogTitle>
                    <DialogDescription>Заполните форму и мы отправим КП на указанный номер</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleHeaderFormSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="h-phone">Телефон *</Label>
                      <Input id="h-phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" onInput={handlePhoneInput} required />
                    </div>
                    <div>
                      <Label htmlFor="h-name">Имя</Label>
                      <Input id="h-name" name="name" type="text" placeholder="Ваше имя" />
                    </div>
                    <div>
                      <Label htmlFor="h-email">Email</Label>
                      <Input id="h-email" name="email" type="email" placeholder="your@email.com" />
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox id="h-consent" required />
                      {consentText}
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
              {navItems.map((item) => (
                <button key={item.anchor} onClick={() => goToSection(item.anchor)} className="block w-full text-left py-2 text-base font-semibold hover:text-primary transition-colors">
                  {item.label}
                </button>
              ))}
              <a href="tel:88005057238" className="block py-2 text-lg font-semibold text-blue-900" onClick={() => trackGoal("click_phone")}>
                8-800-505-72-38
              </a>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-secondary hover:bg-secondary/80 shadow-lg">Оставить заявку</Button>
                </DialogTrigger>
              </Dialog>
            </nav>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 pt-28 pb-10 max-w-2xl flex-1">
        <Button variant="ghost" className="mb-6 text-gray-600" onClick={() => navigate("/")}>
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          Вернуться на сайт
        </Button>

        <h1 className="text-3xl font-bold mb-6 text-gray-900">Корзина</h1>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center mt-8">
            <Icon name="CheckCircle" size={48} className="text-green-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900 mb-2">Заявка отправлена!</p>
            <p className="text-gray-600 mb-6">Мы свяжемся с вами в ближайшее время.</p>
            <Button onClick={() => navigate("/")}>Вернуться на сайт</Button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Icon name="ShoppingCart" size={56} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl mb-6">Корзина пуста</p>
            <Button onClick={() => navigate("/")}>Выбрать модель</Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border mb-6 overflow-hidden">
              {items.map((item, idx) => (
                <div key={item.id} className={`flex items-center justify-between px-5 py-4 ${idx < items.length - 1 ? "border-b" : ""}`}>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-secondary font-bold">{formatPrice(item.price)}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors ml-4" title="Удалить">
                    <Icon name="X" size={18} />
                  </button>
                </div>
              ))}
              <div className="px-5 py-4 bg-gray-50 flex justify-between items-center font-bold text-lg">
                <span>В корзине {items.length} {items.length === 1 ? "товар" : items.length < 5 ? "товара" : "товаров"}</span>
                <span className="text-secondary">{formatPrice(total)}</span>
              </div>
            </div>

            <form onSubmit={handleCartFormSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Оформить без регистрации</h2>
              <div>
                <Label htmlFor="c-name">Ваше имя *</Label>
                <Input id="c-name" name="name" placeholder="Иван Иванов" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="c-phone">Телефон *</Label>
                <Input id="c-phone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required className="mt-1" onInput={handlePhoneInput} />
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="c-consent" required />
                {consentText}
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-secondary hover:bg-secondary/90 text-white text-lg py-6">
                {loading ? "Отправляем..." : "Отправить заявку"}
              </Button>
            </form>

            <div className="text-center mt-4">
              <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2">
                Очистить корзину
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
