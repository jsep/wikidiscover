import './App.css';
import { FeedComponent } from './Feed/FeedComponent';

// interface Article {
//   title: string;
//   description: string;
//   date: string;
//   views: string;
//   imageUrl: string;
//   badges: string[];
// }
// Dummy data for the feed content
// const dummyFeedContent = [
//   {
//     title: 'File:TR Yedigöller asv2021-10 img16.jpg',
//     description:
//       "The Seven Lakes' valley of Yedigöller National Park, Turkey. Photo shows Büyükgöl (Big Lake)",
//     date: 'June 5, 2023',
//     views: '1.2K',
//     imageUrl:
//       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/TR_Yedig%C3%B6ller_asv2021-10_img16.jpg/640px-TR_Yedig%C3%B6ller_asv2021-10_img16.jpg',
//     badges: ['Image'],
//   },
//   {
//     title: 'Project 2025',
//     description:
//       'Proposed plan to consolidate executive power in a Republican president',
//     date: 'June 3, 2023',
//     views: '2.5K',
//     imageUrl:
//       'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/2025_Mandate_for_Leadership_cover.jpg/320px-2025_Mandate_for_Leadership_cover.jpg',
//     badges: ['Most read'],
//   },
//   {
//     title: 'Nasa',
//     description:
//       'The impactor of the NASA space probe Deep Impact collided with the comet Tempel 1, excavating interior material to study its composition.',
//     date: 'June 2, 2023',
//     views: '3.8K',
//     imageUrl:
//       'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/320px-NASA_logo.svg.png',
//     badges: ['On this day'],
//   },
//   {
//     title: 'The Rise of Remote Work: Challenges and Opportunities',
//     description:
//       'Examining the impact of the shift towards remote work and its implications for the future of the workforce.',
//     date: 'June 1, 2023',
//     views: '4.1K',
//     imageUrl: '/placeholder.svg',
//   },
//   {
//     title: 'The Future of Cybersecurity: Protecting Against Evolving Threats',
//     description:
//       'Exploring the latest advancements and strategies in cybersecurity to safeguard against emerging threats.',
//     date: 'May 30, 2023',
//     views: '2.9K',
//     imageUrl: '/placeholder.svg',
//   },
//   {
//     title: 'The Rise of Sustainable Fashion: Trends and Innovations',
//     description:
//       'Exploring the latest advancements and strategies in cybersecurity to safeguard against emerging threats.',
//     date: 'May 28, 2023',
//     views: '1.7K',
//     imageUrl: '/placeholder.svg',
//   },
// ];

function App() {
  return (
    <>
      <div className="w-full max-w-6xl mx-auto py-8 px-4 md:px-6">
        <FeedComponent />
      </div>
    </>
  );
}

// const DateLanguageSelector = ({
//   onSelectionChange,
// }: {
//   onSelectionChange: (date: string, language: string) => void;
// }) => {
//   const [date, setDate] = useState<string>('');
//   const [language, setLanguage] = useState<string>('');
//
//   const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setDate(e.target.value);
//     onSelectionChange(e.target.value, language);
//   };
//
//   const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
//     setLanguage(e.target.value);
//     onSelectionChange(date, e.target.value);
//   };
//
//   return (
//     <div>
//       <input type="date" value={date} onChange={handleDateChange} />
//       <select value={language} onChange={handleLanguageChange}>
//         <option value="en">English</option>
//         <option value="es">Spanish</option>
//         <option value="fr">French</option>
//         {/* Add more languages as needed */}
//       </select>
//     </div>
//   );
// };

// function Controls({
//   onSelectionChange,
// }: {
//   onSelectionChange: (date: string, language: string) => void;
// }) {
//   return (
//     <div className="flex items-center justify-between mb-6">
//       <div className="flex items-center space-x-4">
//         <DateLanguageSelector onSelectionChange={onSelectionChange} />
//       </div>
//     </div>
//   );
// }

// function Feed({ content }: { content: Article[] }) {
//   return (
//     <section>
//       <h2 className="text-left text-2xl font-bold mb-4">
//         Wikipedia Featured Content
//       </h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {content.map((article, index) => (
//           <Article key={index} article={article} />
//         ))}
//       </div>
//       <div className="mt-8 text-center text-muted-foreground">
//         This is the end of featured content.
//       </div>
//     </section>
//   );
// }

// function Article({ article }: { article: Article }) {
//   return (
//     <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
//       <div className="relative">
//         <img
//           src={article.imageUrl}
//           alt={article.title}
//           width="400"
//           height="225"
//           className="w-full h-48 object-cover"
//           style={{ aspectRatio: '400 / 225', objectFit: 'cover' }}
//         />
//         {article.badges?.map((badge: string, index: number) => (
//           <div
//             key={index}
//             className="absolute top-2 left-2 bg-primary px-3 py-1 rounded-md text-primary-foreground text-sm font-medium"
//           >
//             {badge}
//           </div>
//         ))}
//       </div>
//       <div className="p-4 text-left flex flex-col justify-between flex-grow">
//         <div>
//           <h3 className="text-lg font-bold mb-2">{article.title}</h3>
//           <p className="text-sm mb-4">{article.description}</p>
//         </div>
//         <div className="flex items-center space-x-2 text-gray-500 text-sm">
//           <span>{article.date}</span>
//           <span className="text-gray-500">{article.views} views</span>
//         </div>
//       </div>
//     </div>
//   );
// }

export default App;
