import { observer } from 'mobx-react-lite';
import FeedPresenter from './FeedPresenter.ts';

export const FeedControls = observer(
  ({ feedPresenter }: { feedPresenter: FeedPresenter }) => (
    <section>
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
    </section>
  ),
);
