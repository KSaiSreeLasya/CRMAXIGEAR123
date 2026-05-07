import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const stats = [
    {
      label: "Total Retailers",
      value: "245",
      change: "+12%",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Monthly Sales",
      value: "$485K",
      change: "+23%",
      icon: ShoppingCart,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Avg Order Value",
      value: "$3,250",
      change: "+8%",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Active Deals",
      value: "67",
      change: "+15%",
      icon: Zap,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  const features = [
    {
      title: "Sales Pipeline",
      description: "Track EV bike sales from lead to closure with visual pipeline management",
      icon: ShoppingCart,
    },
    {
      title: "Retailer Tracking",
      description: "Monitor retailer performance, inventory levels, and growth metrics in real-time",
      icon: Users,
    },
    {
      title: "Data Analytics",
      description: "Deep insights into sales trends, regional performance, and market opportunities",
      icon: TrendingUp,
    },
    {
      title: "Automated Workflows",
      description: "Streamline follow-ups, orders, and communications with intelligent automation",
      icon: Zap,
    },
  ];

  return (
    <Layout>
      <div className="space-y-12 py-12">
        {/* Hero Section */}
        <section className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Sell More EV Bikes to Retailers
                </h1>
                <p className="text-xl text-muted-foreground">
                  Powerful CRM built specifically for EV bike distributors and their retail partners. Track sales, manage relationships, and scale faster.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 aspect-square flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-24 h-24 text-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  EV Bike Sales Dashboard
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-success font-semibold">
                      {stat.change}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed for EV bike sales teams who want to close more deals and build stronger retailer relationships.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card rounded-xl border border-border p-8 hover:border-primary/50 transition-colors"
                >
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <Link
                    to="/projects"
                    className="text-primary font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Retailers Section */}
        <section className="bg-primary/5 border-y border-primary/20">
          <div className="container mx-auto px-4 py-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Connect with Retailers Effortlessly
                </h2>
                <ul className="space-y-4">
                  {[
                    "Manage multiple retailer accounts in one dashboard",
                    "Track inventory and restocking requests in real-time",
                    "Automated order processing and invoicing",
                    "Performance metrics for each retail partner",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 border border-primary/20 aspect-square flex items-center justify-center">
                <Users className="w-32 h-32 text-primary/30" />
              </div>
            </div>
          </div>
        </section>

        {/* Data Tracking Section */}
        <section className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 border border-primary/20 aspect-square flex items-center justify-center order-2 md:order-1">
              <TrendingUp className="w-32 h-32 text-primary/30" />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold">
                Track Every Metric That Matters
              </h2>
              <p className="text-muted-foreground">
                Get real-time visibility into sales performance, retailer behavior, inventory levels, and market trends. Make data-driven decisions with comprehensive analytics and reporting.
              </p>
              <Link to="/projects">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  View Projects
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Scale Your EV Bike Sales?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join leading EV bike distributors using our CRM to manage retailers and close more deals.
            </p>
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Start Your Free Trial Today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
