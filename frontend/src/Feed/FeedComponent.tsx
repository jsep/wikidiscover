import { useEffect, useRef, useCallback } from 'react';
import FeedPresenter, { ArticuleVM, FeedVM as FeedVM } from './FeedPresenter';
import { observer } from 'mobx-react-lite';
import ErrorScreen from '../Error/ErrorScreen.tsx';

export const FeedComponent = observer(() => {
  const { current: feedPresenter } = useRef(new FeedPresenter());

  const handleScroll = useCallback(() => {
    const bottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 100;
    if (bottom) {
      feedPresenter.loadMore();
      // debounce(() => feedPresenter.loadMore(), 1000)();
    }
  }, [feedPresenter]);

  useEffect(() => {
    feedPresenter.load();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [feedPresenter, handleScroll]);

  // TODO handle not loading data with error screen

  if (feedPresenter.showErrorScreen) {
    return <ErrorScreen />;
  }

  return (
    <div>
      <div>
        <input
          type="date"
          value={feedPresenter.selectedDateString}
          onChange={(event) =>
            feedPresenter.onDateSelected(new Date(event.target.value))
          }
        />

        <select
          value={feedPresenter.selectedLanguage}
          onChange={(event) => feedPresenter.onLangSelected(event.target.value)}
        >
          {feedPresenter.languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.localName} - {language.name}
            </option>
          ))}
        </select>
      </div>
      {/* <FeedSkeleton /> */}
      <Feed
        presenter={feedPresenter}
        feedVm={feedPresenter.currentDateFeedVm}
        isLoading={feedPresenter.isLoading}
      />
      {feedPresenter.moreFeedsVM?.map((feedVm) => (
        <div key={feedVm.date.toISOString()} className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-center bg-gray-700 rounded text-white">
            {feedVm.formattedDate}
          </h3>
          <Feed presenter={feedPresenter} feedVm={feedVm} isLoading={false} />
        </div>
      ))}
      {feedPresenter.isLoadingMore && <FeedSkeleton />}
    </div>
  );
});

export const FeedSkeleton = () => {
  return (
    <section>
      <TodaysFeaturedArticleSkeleten />;
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

export const Feed = observer(
  ({
    presenter,
    feedVm,
    isLoading,
  }: {
    feedVm: FeedVM | null;
    presenter: FeedPresenter;
    isLoading: boolean;
  }) => {
    if (isLoading || !feedVm || !feedVm.tfa || feedVm.articles.length === 0) {
      return <FeedSkeleton />;
    }

    return (
      <section>
        <TodaysFeaturedArticle presenter={presenter} feedVm={feedVm} />
        <FeedArticle presenter={presenter} feedVm={feedVm} />
      </section>
    );
  },
);

export const FeedArticle = observer(
  ({
    presenter,
    feedVm,
  }: {
    presenter: FeedPresenter;
    feedVm: FeedVM | null;
  }) => (
    <section>
      <h2 className="text-left text-2xl font-bold mb-4">
        {feedVm?.featuredContentLabel}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {feedVm?.articles.map((article, index) => (
          <Article key={index} presenter={presenter} article={article} />
        ))}
      </div>
    </section>
  ),
);

const Article = observer(
  ({
    presenter,
    article,
  }: {
    presenter: FeedPresenter;
    article: ArticuleVM;
  }) => (
    <div
      className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col hover:cursor-pointer"
      style={{ opacity: article.isRead ? 0.5 : 1 }}
      onClick={() => {
        presenter.openArticle(article);
      }}
    >
      <div className="relative">
        <img
          src={article.thumbnailUrl}
          alt={article.title}
          width="400"
          height="225"
          className="w-full h-48 object-cover"
          // style={{ aspectRatio: '400 / 225', objectFit: 'cover' }}
        />
        {article.badges?.map((badge: string, index: number) => (
          <div
            key={index}
            className="absolute top-2 left-2 bg-primary px-3 py-1 rounded-md text-primary-foreground text-sm font-medium"
          >
            {badge}
          </div>
        ))}
      </div>
      <div className="p-4 text-left flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-lg font-bold mb-2">{article.title}</h3>
          <p className="max-h-[150px] text-sm mb-4 text-ellipsis overflow-hidden line-clamp-4">
            {article.description}
          </p>
        </div>
        <div className="flex justify-between space-x-2 text-gray-500 text-sm">
          <span>{article.formattedDate}</span>
          {article.views && <span>{article.views} views</span>}
        </div>
      </div>
    </div>
  ),
);

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

const TodaysFeaturedArticle = observer(
  ({ presenter, feedVm }: { presenter: FeedPresenter; feedVm: FeedVM }) => {
    if (!feedVm) {
      // TODO handle not loading data error screen
      throw new Error('Feed not loaded');
    }
    const tfa = feedVm?.tfa;
    if (!tfa) {
      // TODO handle not loading data error screen
      throw new Error('TFA not loaded');
    }

    return (
      <section className="mb-8 hover:cursor-pointer">
        <div
          className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-lg"
          style={{ opacity: tfa.isRead ? 0.5 : 1 }}
          onClick={() => presenter.openArticle(tfa)}
        >
          <div className="absolute top-2 left-2 bg-primary px-3 py-1 rounded-md text-primary-foreground text-sm font-medium">
            {tfa.badges?.join(' ')}
          </div>
          <img
            src={tfa.thumbnailUrl}
            alt={tfa.title}
            width="1200"
            height="600"
            className="w-full h-full object-contain"
            // style={{ aspectRatio: '1200 / 600' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="text-white">
              <h2 className="text-left text-2xl md:text-3xl font-bold mb-2">
                {tfa.title}
              </h2>
              <p className="text-left text-sm md:text-base mb-4 text-ellipsis overflow-hidden line-clamp-4">
                {tfa.description}
              </p>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm text-gray-300">
                  {tfa.formattedDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

function TodaysFeaturedArticleSkeleten() {
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
