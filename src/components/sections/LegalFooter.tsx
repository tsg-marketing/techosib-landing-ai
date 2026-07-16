import { Link } from 'react-router-dom';

export default function LegalFooter() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          <img src="https://cdn.poehali.dev/files/ЛОГО_ТСг.jpg" alt="ТЕХНОСИБ" className="h-16 mx-auto" />
          <p className="text-gray-400">Надежное упаковочное оборудование для вашего бизнеса</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-gray-400">
            <Link to="/" className="hover:text-white transition-colors">Главная</Link>
            <Link to="/calc" className="hover:text-white transition-colors">Калькулятор</Link>
            <Link to="/cart" className="hover:text-white transition-colors">Корзина</Link>
          </div>
          <div className="max-w-3xl mx-auto pt-4 text-xs leading-relaxed text-gray-500 border-t border-gray-800 space-y-1">
            <p>Общество с ограниченной ответственностью «Техно-Сиб Групп»</p>
            <p>Юридический адрес: 630005, г. Новосибирск, ул. Крылова, д. 36, этаж 8, офис 81</p>
            <p>ИНН 5406804844 · ОГРН 1205400012146 · КПП 540601001</p>
          </div>
          <div className="text-sm text-gray-500 pt-2">
            2026 ТЕХНОСИБ. Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  );
}
