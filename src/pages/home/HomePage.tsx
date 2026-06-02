import { Link } from "react-router";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const featureHighlights = [
  {
    title: "Fast delivery",
    description: "Quick dispatch with a smooth checkout experience.",
    accent: "from-pink-500 to-rose-500",
  },
  {
    title: "Secure payments",
    description: "Clear order summary and safe payment flow.",
    accent: "from-indigo-500 to-blue-500",
  },
  {
    title: "Quality products",
    description: "Browse curated items with clean product details.",
    accent: "from-emerald-500 to-teal-500",
  },
];

const categories = [
  { name: "Electronics", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { name: "Fashion", color: "bg-pink-50 text-pink-700 border-pink-100" },
  { name: "Home & Kitchen", color: "bg-amber-50 text-amber-700 border-amber-100" },
  { name: "Beauty", color: "bg-violet-50 text-violet-700 border-violet-100" },
];

const featuredProducts = [
  {
    name: "Wireless Headphones",
    price: "₹2,499",
    tag: "Best seller",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    name: "Smart Watch",
    price: "₹4,999",
    tag: "Popular",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    name: "Table Lamp",
    price: "₹1,299",
    tag: "New",
    gradient: "from-amber-500 to-orange-500",
  },
];

export default function HomePage() {
  return (
    <section className="bg-gradient-to-b from-white via-pink-50/40 to-blue-50/50">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-700 shadow-sm">
              Fresh picks, better shopping
            </span>

            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-bold tracking-tight text-black md:text-6xl">
                Discover products that feel modern, simple, and delightful.
              </h1>
              <p className="max-w-xl text-base leading-7 text-gray-600 md:text-lg">
                ShopNest brings a cleaner shopping flow with colourful cards,
                fast checkout, and a smoother experience from browse to order.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button>Shop now</Button>
              </Link>
              <Link to="/orders">
                <Button variant="secondary">View orders</Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-black">500+</p>
                <p className="text-sm text-gray-500">Curated products</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-black">24h</p>
                <p className="text-sm text-gray-500">Quick dispatch</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-black">99%</p>
                <p className="text-sm text-gray-500">Happy shoppers</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-pink-300/30 blur-3xl" />
            <div className="absolute -right-6 bottom-10 h-28 w-28 rounded-full bg-blue-300/30 blur-3xl" />

            <Card>
              <div className="space-y-5">
                <div className="rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 p-6 text-white shadow-lg">
                  <p className="text-sm font-medium opacity-90">Today’s highlight</p>
                  <h2 className="mt-2 text-2xl font-bold">
                    A brighter shopping experience
                  </h2>
                  <p className="mt-2 text-sm leading-6 opacity-90">
                    Clean layouts, smoother navigation, and colourful product
                    discovery.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {categories.map((category) => (
                    <div
                      key={category.name}
                      className={`rounded-2xl border px-4 py-3 text-center text-sm font-semibold ${category.color}`}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {featuredProducts.map((product) => (
                    <div
                      key={product.name}
                      className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
                    >
                      <div
                        className={`h-28 bg-gradient-to-br ${product.gradient}`}
                      />
                      <div className="p-4">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                          {product.tag}
                        </span>
                        <h3 className="mt-3 text-sm font-semibold text-black">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {product.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featureHighlights.map((item) => (
            <Card key={item.title}>
              <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${item.accent}`} />
              <h3 className="mt-4 text-lg font-semibold text-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {item.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] bg-black px-6 py-8 text-white md:px-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-pink-300">Start exploring</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                Find your next favourite product today.
              </h2>
            </div>
            <Link to="/products">
              <Button>Browse products</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}