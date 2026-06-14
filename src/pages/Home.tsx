import { Link } from 'react-router-dom';
import { Home as HomeIcon, Building2, TreePine, Store, ArrowRight } from 'lucide-react';
import { Button } from '../components/common';

const Home = () => {
  const categories = [
    { icon: HomeIcon, name: 'Apartments', count: 15, path: '/properties?propertyType=apartment', color: 'from-teak-500 to-walnut-600' },
    { icon: Building2, name: 'Villas', count: 28, path: '/properties?propertyType=villa', color: 'from-walnut-500 to-walnut-700' },
    { icon: TreePine, name: 'Land', count: 12, path: '/properties?propertyType=land', color: 'from-olive-500 to-teak-600' },
    { icon: Store, name: 'Commercial', count: 8, path: '/properties?propertyType=commercial', color: 'from-teal-500 to-teak-600' },
  ];

  const stats = [
    { label: 'Properties Listed', value: '500+' },
    { label: 'Happy Families', value: '1,200+' },
    { label: 'Years Experience', value: '15+' },
    { label: 'Locations Served', value: '25+' },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 lg:pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Luxury Indian Villa"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-walnut-900/85 via-walnut-800/75 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <p className="text-teak-400 font-medium tracking-wide mb-4 uppercase text-sm">
            Premium Properties Across India
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-cream-50 leading-tight mb-6">
            Find Your Dream <br />
            <span className="text-teak-400">Home in India</span>
          </h1>
          <p className="text-lg text-cream-100/90 mb-10 leading-relaxed max-w-2xl">
            Discover heritage villas, waterfront estates, and modern retreats across the serene landscapes of India.
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 lg:py-28 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-walnut-800 mb-4">
              Explore by Category
            </h2>
            <p className="text-walnut-600 max-w-2xl mx-auto">
              From heritage villas to modern commercial spaces, find the perfect property type that matches your lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  to={category.path}
                  className="group relative overflow-hidden rounded-2xl p-6 lg:p-8 bg-cream-50 border border-walnut-100 hover:border-teak-200 shadow-sm hover:shadow-xl transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 text-cream-50" />
                  </div>
                  <h3 className="text-lg font-semibold text-walnut-800 mb-2 group-hover:text-teak-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-walnut-500">{category.count} Properties</p>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-teak-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 lg:py-32 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/210604/pexels-photo-210604.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Luxury Property Interior"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-walnut-900/30 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-cream-50 rounded-2xl p-6 shadow-xl border border-walnut-100 hidden lg:block">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-2xl font-bold text-teak-700">{stat.value}</p>
                      <p className="text-sm text-walnut-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <p className="text-teak-600 font-medium tracking-wide uppercase text-sm">
                About EstateVista
              </p>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-walnut-800 leading-tight">
                We Connect You to India's<br />Finest Properties
              </h2>
              <div className="space-y-4 text-walnut-600 leading-relaxed">
                <p>
                  EstateVista is India's premier India-wide real estate platform, specializing in luxury heritage homes,
                  waterfront villas, and premium properties across the state.
                </p>
                <p>
                  With over 15 years of expertise and deep roots in the India-wide property market references, we understand the unique charm of traditional
                  architectural styles, the elegance of colonial structures, and the modern conveniences that discerning buyers seek.
                </p>
                <p>
                  Our curated listings span from serene lakeside escapes and mist-covered mountain hill stations to vibrant
                  historic city centers, financial hubs, and pristine coastal regions across major national destinations.
                </p>
              </div>
              <div className="pt-4">
                <Button>Learn More About Us</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-walnut-800 to-walnut-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-cream-50 mb-6">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-lg text-cream-100/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            Browse our exclusive collection of properties and connect with our expert realtors today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/properties">
              <Button className="bg-teak-600 hover:bg-teak-700 text-cream-50 px-8">
                Browse Properties
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-cream-50 text-cream-50 hover:bg-cream-50/10 px-8">
                Sign In as Realtor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

