export const FeedSkeleton = () => {
  return (
    <section>
      <FeaturedArticleSkeleton />;
      <FeedArticleSkeleton />
    </section>
  );
};

export const FeedArticleSkeleton = () => {
  return (
    <section>
      <div className="h-[32px] bg-gray-300 rounded-md mb-4 w-1/3 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <ArticleSkeleton />
        <ArticleSkeleton />
        <ArticleSkeleton />
        <ArticleSkeleton />
        <ArticleSkeleton />
        <ArticleSkeleton />
      </div>
    </section>
  );
};

const ArticleSkeleton = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col animate-pulse">
    <div className="relative">
      <img
        src="/placeholder.svg"
        alt="placeholder"
        className="w-full h-48 object-cover"
        style={{ aspectRatio: '400 / 225', objectFit: 'cover' }}
      />
      <div className="absolute top-2 left-2 bg-primary px-3 py-1 rounded-md text-primary-foreground text-sm font-medium w-24 h-6"></div>
    </div>
    <div className="p-4 text-left flex flex-col justify-between flex-grow">
      <div>
        <div className="h-6 bg-gray-300 rounded-md mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded-md mb-1 w-full"></div>
        <div className="h-4 bg-gray-300 rounded-md mb-1 w-11/12"></div>
        <div className="h-4 bg-gray-300 rounded-md mb-4 w-10/12"></div>
      </div>
      <div className="flex justify-between space-x-2 text-gray-500 text-sm">
        <div className="h-4 bg-gray-300 rounded-md w-1/4"></div>
        <div className="h-4 bg-gray-300 rounded-md w-1/4"></div>
      </div>
    </div>
  </div>
);

function FeaturedArticleSkeleton() {
  return (
    <section className="mb-8">
      <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-lg">
        <div className="h-[28px] w-[100px] absolute top-2 left-2 bg-primary px-3 py-1 rounded-md text-primary-foreground text-sm font-medium animate-pulse"></div>
        <img
          src="/placeholder.svg"
          alt="placeholder"
          width="1200"
          height="600"
          className="w-full h-full object-cover"
          style={{ aspectRatio: '1200 / 600', objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 animate-pulse">
          <div className="text-white">
            <div className="h-[36px] bg-muted rounded-md mb-2 w-3/4"></div>
            <div className="h-4 bg-muted rounded-md mb-1 w-12/12"></div>
            <div className="h-4 bg-muted rounded-md mb-1 w-11/12"></div>
            <div className="h-4 bg-muted rounded-md mb-4 w-10/12"></div>
            <div className="h-4 bg-muted w-1/6"></div>
            <div className="h-4 bg-muted w-1/6"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
