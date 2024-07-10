import { useCallback, useEffect, useRef } from 'react';
import FeedPresenter, { FeedVM as FeedVM } from './FeedPresenter';
import { observer } from 'mobx-react-lite';
import ErrorScreen from '../Error/ErrorScreen.tsx';
import { FeedArticles } from './FeedArticles.tsx';
import { FeaturedArticle } from './FeaturedArticle.tsx';
import { FeedSkeleton } from './FeedSkeleton.tsx';
import { FeedControls } from './FeedControls.tsx';

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

  if (feedPresenter.showErrorScreen) {
    return <ErrorScreen />;
  }

  return (
    <div>
      <FeedControls feedPresenter={feedPresenter} />
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
        <FeaturedArticle presenter={presenter} feedVm={feedVm} />
        <FeedArticles presenter={presenter} feedVm={feedVm} />
      </section>
    );
  },
);
