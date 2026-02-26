import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { saveUtmToCookies, getUtmFromCookies } from "@/utils/utm";

export default function Cart() {
  const { items, clearCart, total, removeItem } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatPrice = (n: number) =>
    n > 0 ? n.toLocaleString("ru-RU") + " руб" : "по запросу";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    saveUtmToCookies();

    const modelList = items.map(i => `${i.name} — ${formatPrice(i.price)}`).join(", ");
    const comment = `Заказ из корзины: ${modelList}. Итого: ${formatPrice(total)}`;
    const utmData = getUtmFromCookies();

    const requestData = {
      name,
      phone,
      email: "",
      company: "",
      comment,
      productType: "Паллетообмотчик",
      modelType: items.map(i => i.name).join(", "),
      url: window.location.href,
      ...utmData,
    };

    try {
      await fetch("/api/b24-send-lead.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      setSubmitted(true);
      clearCart();
    } catch {
      alert("Ошибка отправки. Попробуйте позже или позвоните нам.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-10 max-w-2xl flex-1">
        <Button variant="ghost" className="mb-6 text-gray-600" onClick={() => navigate("/")}>
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          Вернуться на сайт
        </Button>

        <h1 className="text-3xl font-bold mb-2 text-gray-900">Корзина</h1>

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
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-4"
                    title="Удалить"
                  >
                    <Icon name="X" size={18} />
                  </button>
                </div>
              ))}
              <div className="px-5 py-4 bg-gray-50 flex justify-between items-center font-bold text-lg">
                <span>В корзине {items.length} {items.length === 1 ? "товар" : items.length < 5 ? "товара" : "товаров"}</span>
                <span className="text-secondary">{formatPrice(total)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Оформить без регистрации</h2>
              <div>
                <Label htmlFor="name">Ваше имя</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+7 999 000-00-00"
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-secondary hover:bg-secondary/90 text-white text-lg py-6">
                {loading ? "Отправляем..." : "Отправить заявку"}
              </Button>
            </form>

            <div className="text-center mt-4">
              <button
                onClick={clearCart}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
              >
                Очистить корзину
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
