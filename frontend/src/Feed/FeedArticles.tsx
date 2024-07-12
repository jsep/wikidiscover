import { observer } from 'mobx-react-lite';
import FeedPresenter, { ArticuleVM, FeedVM } from './FeedPresenter.ts';

export const FeedArticles = observer(
  ({
    presenter,
    feedVm,
  }: {
    presenter: FeedPresenter;
    feedVm: FeedVM | null;
  }) => (
    <section className={feedVm?.articles.length == 0 ? 'hidden' : ''}>
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

export const Article = observer(
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
