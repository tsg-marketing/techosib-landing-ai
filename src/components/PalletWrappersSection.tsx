import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import ImageCarousel from "@/components/ImageCarousel";
import { useCart } from "@/hooks/useCart";

const API_URL = "https://functions.poehali.dev/31c5d88e-1565-4747-b3b5-8009e4b337a1";

interface FeedItem {
  offer_id: string;
  category_id: string;
  brand: string;
  name: string;
  url: string;
  price: number;
  currency: string;
  available: boolean;
  picture: string;
  description: string;
  video_url: string;
  images: string[];
  params: Record<string, string>;
}

interface FeedResponse {
  items: FeedItem[];
  brands: string[];
  last_update: string | null;
  items_count: number;
}

const BRAND_ORDER = ["ТЕХНОСИБ", "Robopac", "Hualian"];

function brandRank(b: string): number {
  const idx = BRAND_ORDER.findIndex(
    (x) => x.toLowerCase() === (b || "").toLowerCase()
  );
  return idx === -1 ? BRAND_ORDER.length : idx;
}

// Параметры, которые выводятся в карточке на лендинге.
// Ключи массива — подстроки, которые ищем в названиях параметров (без учёта регистра).
const CARD_PARAM_INCLUDES: Record<string, string[]> = {
  ТЕХНОСИБ: [
    "бренд",
    "предварительное растяжение пленки",
    "максимальные размеры паллета",
    "максимальная высота паллета с грузом",
    "грузоподъемность",
  ],
  Robopac: [
    "бренд",
    "диаметр поворотного стола",
    "максимальный вес",
    "высота",
    "предварительное растяжение пленки",
  ],
  Hualian: [
    "бренд",
    "диаметр платформы",
    "тип оборудования",
    "предрастяжение",
    "макс. высота груза",
    "макс. вес паллеты",
  ],
};

function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/ё/g, "е");
}

function brandKey(brand: string): keyof typeof CARD_PARAM_INCLUDES | null {
  const b = (brand || "").toLowerCase();
  if (b.includes("техносиб")) return "ТЕХНОСИБ";
  if (b.includes("robopac")) return "Robopac";
  if (b.includes("hualian")) return "Hualian";
  return null;
}

function allParams(params: Record<string, string>): [string, string][] {
  return Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && String(v).trim() !== ""
  );
}

function cardParams(
  params: Record<string, string>,
  brand: string
): [string, string][] {
  const key = brandKey(brand);
  const includes = key ? CARD_PARAM_INCLUDES[key] : null;
  const entries = allParams(params);
  if (!includes) return entries;

  const normIncludes = includes.map((s) => normalizeKey(s));
  const result: [string, string][] = [];
  for (const inc of normIncludes) {
    for (const [k, v] of entries) {
      if (normalizeKey(k).includes(inc) && !result.find(([rk]) => rk === k)) {
        result.push([k, v]);
      }
    }
  }
  return result;
}

function orderedParams(params: Record<string, string>): [string, string][] {
  const entries = allParams(params);
  entries.sort(([a], [b]) => a.localeCompare(b, "ru"));
  return entries;
}

function formatPrice(price: number): string {
  if (!price || price <= 0) return "по запросу";
  return new Intl.NumberFormat("ru-RU").format(Math.round(price)) + " руб";
}

function toEmbedUrl(videoUrl: string): string {
  if (!videoUrl) return "";
  if (videoUrl.includes("/play/embed/")) return videoUrl;
  const m = videoUrl.match(/rutube\.ru\/video\/([a-zA-Z0-9]+)/);
  if (m) return `https://rutube.ru/play/embed/${m[1]}/`;
  return videoUrl;
}

interface Props {
  onLeaveRequest?: (modelName: string) => void;
}

export default function PalletWrappersSection({ onLeaveRequest }: Props) {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string>("");

  const [specsOpen, setSpecsOpen] = useState(false);
  const [specsItem, setSpecsItem] = useState<FeedItem | null>(null);

  const [videoOpen, setVideoOpen] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>("");

  const { items, addItem, removeItem } = useCart();

  const toggleCart = (item: FeedItem) => {
    if (items.some((i) => i.id === item.offer_id)) {
      removeItem(item.offer_id);
    } else {
      const price = item.price > 0 ? Math.round(item.price) : 0;
      addItem({ id: item.offer_id, name: item.name, price });
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_URL);
        const json: FeedResponse = await res.json();
        if (cancelled) return;
        setData(json);
        const sortedBrands = [...(json.brands || [])].sort(
          (a, b) => brandRank(a) - brandRank(b)
        );
        if (sortedBrands.length > 0) {
          setActiveBrand(sortedBrands[0]);
        }
      } catch (e) {
        if (!cancelled) setError("Не удалось загрузить каталог");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, FeedItem[]> = {};
    if (!data) return map;
    for (const it of data.items) {
      const b = it.brand || "Другое";
      if (!map[b]) map[b] = [];
      map[b].push(it);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => {
        const ap = a.price > 0 ? a.price : Number.POSITIVE_INFINITY;
        const bp = b.price > 0 ? b.price : Number.POSITIVE_INFINITY;
        if (ap !== bp) return ap - bp;
        return a.name.localeCompare(b.name, "ru");
      });
    }
    return map;
  }, [data]);

  const brands = useMemo(
    () => [...(data?.brands ?? [])].sort((a, b) => brandRank(a) - brandRank(b)),
    [data]
  );

  const openSpecs = (item: FeedItem) => {
    setSpecsItem(item);
    setSpecsOpen(true);
  };

  const openVideo = (url: string) => {
    setVideoSrc(toEmbedUrl(url));
    setVideoOpen(true);
  };

  return (
    <section id="models" className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Модели паллетообмотчиков
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Выберите оптимальную модель для вашего бизнеса. Все модели производятся на современном оборудовании с контролем качества на каждом этапе.
        </p>

        {loading && (
          <div className="flex justify-center items-center py-16">
            <Icon name="Loader2" size={40} className="animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-8">{error}</div>
        )}

        {!loading && !error && data && brands.length > 0 && (
          <Tabs value={activeBrand} onValueChange={setActiveBrand} className="w-full">
            <TabsList className="mx-auto flex flex-wrap gap-2 justify-center mb-8 bg-transparent h-auto p-0">
              {brands.map((b) => (
                <TabsTrigger
                  key={b}
                  value={b}
                  className="text-base md:text-lg px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white bg-gray-100 rounded-lg"
                >
                  {b}
                </TabsTrigger>
              ))}
            </TabsList>

            {brands.map((b) => (
              <TabsContent key={b} value={b} className="mt-0">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(grouped[b] ?? []).map((item) => (
                    <Card
                      key={item.offer_id}
                      className="hover:shadow-xl transition-shadow flex flex-col"
                    >
                      <ImageCarousel images={item.images} alt={item.name} />
                      <CardHeader>
                        <CardTitle className="text-xl text-gray-900 leading-snug">
                          {item.name}
                        </CardTitle>
                        <CardDescription className="text-2xl font-bold text-secondary">
                          {formatPrice(item.price)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <ul className="space-y-2 mb-6 flex-1">
                          {cardParams(item.params, item.brand).map(([key, value]) => (
                            <li
                              key={key}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <Icon
                                name="Check"
                                size={16}
                                className="text-primary mt-0.5 flex-shrink-0"
                              />
                              <span>
                                <span className="text-gray-500">{key}:</span>{" "}
                                <span className="font-medium">{value}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="space-y-2">
                          {item.description && (
                            <Button
                              variant="outline"
                              className="w-full text-base py-5"
                              onClick={() => openSpecs(item)}
                            >
                              <Icon name="FileText" size={18} className="mr-2" />
                              Детальные характеристики
                            </Button>
                          )}
                          {item.video_url && (
                            <Button
                              className="w-full text-base py-5 bg-red-500/80 hover:bg-red-600 text-white"
                              onClick={() => openVideo(item.video_url)}
                            >
                              <Icon name="Play" size={18} className="mr-2" />
                              Посмотреть видео
                            </Button>
                          )}
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-secondary hover:bg-secondary/80 text-white text-lg py-6 shadow-lg"
                              onClick={() => onLeaveRequest?.(item.name)}
                            >
                              Оставить заявку
                            </Button>
                            <Button
                              variant={
                                items.some((i) => i.id === item.offer_id)
                                  ? "default"
                                  : "outline"
                              }
                              className={`py-6 px-4 ${
                                items.some((i) => i.id === item.offer_id)
                                  ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                                  : ""
                              }`}
                              onClick={() => toggleCart(item)}
                              title={
                                items.some((i) => i.id === item.offer_id)
                                  ? "Убрать из корзины"
                                  : "Добавить в корзину"
                              }
                            >
                              <Icon name="ShoppingCart" size={20} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {!loading && !error && data && brands.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Каталог временно пуст. Идёт обновление данных.
          </div>
        )}
      </div>

      <Dialog open={specsOpen} onOpenChange={setSpecsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {specsItem?.name}
            </DialogTitle>
            <DialogDescription>Детальные характеристики</DialogDescription>
          </DialogHeader>
          {specsItem && (
            <div className="py-4 space-y-6">
              {specsItem.description && (
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: specsItem.description }}
                />
              )}
              {Object.keys(specsItem.params).length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Параметры</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {orderedParams(specsItem.params).map(([k, v]) => (
                      <div key={k} className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">{k}</div>
                        <div className="text-gray-800 font-medium">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  onClick={() => {
                    setSpecsOpen(false);
                    onLeaveRequest?.(specsItem.name);
                  }}
                >
                  Оставить заявку
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Видео</DialogTitle>
          </DialogHeader>
          {videoSrc && (
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={videoSrc}
                allow="clipboard-write; autoplay"
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}