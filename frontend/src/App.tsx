import { useState, useEffect } from "react";
import "./App.css";

const todaysFeatureArticule = {
  title: "Statue of Liberty",
  description:
    "The Statue of Liberty is a colossal neoclassical sculpture on Liberty Island in New York Harbor, within New York City. The copper-clad statue, a gift to the United States from the people of France, was designed by French sculptor Frédéric Auguste Bartholdi and its metal framework was built by Gustave Eiffel. The statue was dedicated on October 28, 1886.",
  date: "June 1, 2023",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Front_view_of_Statue_of_Liberty_with_pedestal_and_base_2024.jpg/640px-Front_view_of_Statue_of_Liberty_with_pedestal_and_base_2024.jpg",
};
// Dummy data for the feed content
const dummyFeedContent = [
  {
    title: "File:TR Yedigöller asv2021-10 img16.jpg",
    description:
      "The Seven Lakes' valley of Yedigöller National Park, Turkey. Photo shows Büyükgöl (Big Lake)",
    date: "June 5, 2023",
    views: "1.2K",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/TR_Yedig%C3%B6ller_asv2021-10_img16.jpg/640px-TR_Yedig%C3%B6ller_asv2021-10_img16.jpg",
    badges: ["Image"],
  },
  {
    title: "Project 2025",
    description:
      "Proposed plan to consolidate executive power in a Republican president",
    date: "June 3, 2023",
    views: "2.5K",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/2025_Mandate_for_Leadership_cover.jpg/320px-2025_Mandate_for_Leadership_cover.jpg",
    badges: ["Most read"],
  },
  {
    title: "Nasa",
    description:
      "The impactor of the NASA space probe Deep Impact collided with the comet Tempel 1, excavating interior material to study its composition.",
    date: "June 2, 2023",
    views: "3.8K",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/320px-NASA_logo.svg.png",
    badges: ["On this day"],
  },
  {
    title: "The Rise of Remote Work: Challenges and Opportunities",
    description:
      "Examining the impact of the shift towards remote work and its implications for the future of the workforce.",
    date: "June 1, 2023",
    views: "4.1K",
    imageUrl: "/placeholder.svg",
  },
  {
    title: "The Future of Cybersecurity: Protecting Against Evolving Threats",
    description:
      "Exploring the latest advancements and strategies in cybersecurity to safeguard against emerging threats.",
    date: "May 30, 2023",
    views: "2.9K",
    imageUrl: "/placeholder.svg",
  },
  {
    title: "The Rise of Sustainable Fashion: Trends and Innovations",
    description:
      "Exploring the latest advancements and strategies in cybersecurity to safeguard against emerging threats.",
    date: "May 28, 2023",
    views: "1.7K",
    imageUrl: "/placeholder.svg",
  },
];

function App() {
  const [date, setDate] = useState("");
  const [language, setLanguage] = useState("en");
  const [content, setContent] = useState([]);

  useEffect(() => {
    console.log("date:", typeof date);
    if (date && language) {
      const formattedDate = date.split("-").join("/");
      fetch(
        `https://api.wikimedia.org/feed/v1/wikipedia/${language}/featured/${formattedDate}`
      )
        .then((response) => response.json())
        .then((data) => setContent(data.items))
        .catch((error) => console.error("Error fetching content:", error));
    }
  }, [date, language]);

  const handleSelectionChange = (selectedDate, selectedLanguage) => {
    setDate(selectedDate);
    setLanguage(selectedLanguage);
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto py-8 px-4 md:px-6">
        <Controls onSelectionChange={handleSelectionChange} />
        <TodaysFeaturedArticle />
        <Feed content={dummyFeedContent} />
      </div>
    </>
  );
}

const DateLanguageSelector = ({ onSelectionChange }) => {
  const [date, setDate] = useState("");
  const [language, setLanguage] = useState("");

  const handleDateChange = (e) => {
    setDate(e.target.value);
    onSelectionChange(e.target.value, language);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    onSelectionChange(date, e.target.value);
  };

  return (
    <div>
      <input type="date" value={date} onChange={handleDateChange} />
      <select value={language} onChange={handleLanguageChange}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        {/* Add more languages as needed */}
      </select>
    </div>
  );
};

function Controls({ onSelectionChange }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <DateLanguageSelector onSelectionChange={onSelectionChange} />
      </div>
    </div>
  );
}

function TodaysFeaturedArticle() {
  return (
    <section className="mb-8">
      <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-lg">
        <div className="absolute top-2 left-2 bg-primary px-3 py-1 rounded-md text-primary-foreground text-sm font-medium">
          Today's Featured
        </div>
        <img
          src={todaysFeatureArticule.imageUrl}
          alt={todaysFeatureArticule.title}
          width="1200"
          height="600"
          className="w-full h-full object-cover"
          style={{ aspectRatio: "1200 / 600", objectFit: "contain" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="text-white">
            <h2 className="text-left text-2xl md:text-3xl font-bold mb-2">
              {todaysFeatureArticule.title}
            </h2>
            <p className="text-left text-sm md:text-base mb-4 text-ellipsis overflow-hidden">
              {todaysFeatureArticule.description}
            </p>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm text-gray-300">
                {todaysFeatureArticule.date}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feed({ content }) {
  return (
    <section>
      <h2 className="text-left text-2xl font-bold mb-4">
        Wikipedia Featured Content
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {content.map((article, index) => (
          <Article key={index} article={article} />
        ))}
      </div>
      <div className="mt-8 text-center text-muted-foreground">
        This is the end of featured content.
      </div>
    </section>
  );
}

function Article({ article }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="relative">
        <img
          src={article.imageUrl}
          alt={article.title}
          width="400"
          height="225"
          className="w-full h-48 object-cover"
          style={{ aspectRatio: "400 / 225", objectFit: "cover" }}
        />
        {article.badges?.map((badge) => (
          <div className="absolute top-2 left-2 bg-primary px-3 py-1 rounded-md text-primary-foreground text-sm font-medium">
            {badge}
          </div>
        ))}
      </div>
      <div className="p-4 text-left flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-lg font-bold mb-2">{article.title}</h3>
          <p className="text-sm mb-4">{article.description}</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-500 text-sm">
          <span>{article.date}</span>
          <span className="text-gray-500">{article.views} views</span>
        </div>
      </div>
    </div>
  );
}

export default App;
