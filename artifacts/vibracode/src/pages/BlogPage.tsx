export default function BlogPage() {
  const blogPosts = [
    { title: "10 Essential Features Every Mobile App Should Have", excerpt: "Discover the must-have features that make mobile apps successful and user-friendly.", date: "2024-01-15", readTime: "5 min read", category: "App Development" },
    { title: "How AI is Revolutionizing Mobile App Development", excerpt: "Explore how artificial intelligence is transforming the way we create mobile apps.", date: "2024-01-10", readTime: "7 min read", category: "AI Technology" },
    { title: "Cross-Platform vs Native App Development: Which is Better?", excerpt: "Compare cross-platform and native app development approaches to determine the best strategy.", date: "2024-01-05", readTime: "6 min read", category: "Development Strategy" },
    { title: "Mobile App UI/UX Design Best Practices for 2024", excerpt: "Learn the latest UI/UX design principles that will make your mobile app stand out.", date: "2024-01-01", readTime: "8 min read", category: "Design" },
    { title: "Building Your First Mobile App: A Complete Beginner's Guide", excerpt: "Step-by-step guide for complete beginners on how to create their first mobile app.", date: "2023-12-28", readTime: "10 min read", category: "Tutorial" },
    { title: "The Future of No-Code Mobile App Development", excerpt: "Explore the growing trend of no-code app development and how it's democratizing mobile app creation.", date: "2023-12-25", readTime: "6 min read", category: "Industry Trends" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Mobile App Development Blog</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Stay updated with the latest insights, tips, and tutorials about mobile app development and AI technology.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 group">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-purple-600/20 text-purple-300 text-sm font-medium rounded-full">{post.category}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">{post.title}</h2>
                  <p className="text-gray-300 mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
