import { useEffect, useRef } from 'react';
import FeedPresenter from './FeedPresenter';
import { observer } from 'mobx-react-lite';

export const FeedComponent = observer(() => {
  const { current: booksPresenter } = useRef(new FeedPresenter());

  useEffect(() => {
    booksPresenter.load();
  }, [booksPresenter]);

  // TODO handle not loading data with error screen
  return (
    <div>
      <div>
        <input
          type="date"
          // value={booksPresenter.selectedDate}
          onChange={(event) =>
            booksPresenter.onDateSelected(new Date(event.target.value))
          }
        />
      </div>
      <TodaysFeaturedArticle presenter={booksPresenter} />
    </div>
  );
});

const TodaysFeaturedArticle = observer(
  ({ presenter }: { presenter: FeedPresenter }) => {
    if (presenter.isLoading) {
      return <TodaysFeaturedArticleSkeleten />;
    }
    if (!presenter.feedVm) {
      // TODO handle not loading data with loading screen
      throw new Error('Feed not loaded');
    }
    const tfa = presenter.feedVm.tfa;
    return (
      <section className="mb-8">
        <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-lg">
          <div className="absolute top-2 left-2 bg-primary px-3 py-1 rounded-md text-primary-foreground text-sm font-medium">
            Today's Featured
          </div>
          <img
            src={tfa.thumbnailUrl}
            alt={tfa.title}
            width="1200"
            height="600"
            className="w-full h-full object-cover"
            style={{ aspectRatio: '1200 / 600', objectFit: 'contain' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="text-white">
              <h2 className="text-left text-2xl md:text-3xl font-bold mb-2">
                {tfa.title}
              </h2>
              <p className="text-left text-sm md:text-base mb-4 text-ellipsis overflow-hidden">
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
        <div className="absolute top-2 left-2 bg-primary px-3 py-1 rounded-md text-primary-foreground text-sm font-medium">
          Today's Featured
        </div>
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
            <div className="h-6 bg-muted rounded-md mb-2 w-3/4"></div>
            <div className="h-4 bg-muted rounded-md mb-1 w-12/12"></div>
            <div className="h-4 bg-muted rounded-md mb-1 w-11/12"></div>
            <div className="h-4 bg-muted rounded-md mb-4 w-10/12"></div>
            <div className="h-4 bg-muted w-1/6"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
