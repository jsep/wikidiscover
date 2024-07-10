import { observer } from 'mobx-react-lite';
import FeedPresenter, { FeedVM } from './FeedPresenter.ts';

export const FeaturedArticle = observer(
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
