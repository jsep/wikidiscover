# Fullstack Web Development Challenge

Welcome to our Fullstack Web Development Challenge, designed to assess your coding skills and problem-solving abilities. This challenge encompasses both frontend and backend tasks, allowing you to demonstrate your proficiency in web application development. Our aim is not only to evaluate your technical skills but also to see how you approach learning new tools and concepts.

## Frontend: ReactJS

### Introduction

This challenge involves creating a ReactJS application that leverages the Wikipedia Featured Content API. The goal is to develop a user-friendly interface allowing users to explore featured content based on selected dates and languages. This project is an opportunity to demonstrate your skills in building interactive frontend applications with attention to code quality, UI/UX design, and functionality.

### Objective

Build a ReactJS application that:

- Interacts with the [Wikipedia Featured Content API](https://api.wikimedia.org/wiki/Feed_API/Reference/Featured_content).
- Displays content based on user-selected dates and languages.
- Offers a paged grid format for browsing the featured content.

### Functional Requirements

#### Date and Language Selection

- Implement UI elements for date and language selection.
- Fetch and display content based on these selections.

#### Paged Grid Display

- Present the content in a grid of cards, with 5 cards per page.
- Include pagination controls for page navigation.
- **Bonus feature:** Enable users to customize the page size.
- **Advance bonus feature:** Implement infinite scrolling, loading content for the next day as the user reaches the bottom.

#### Card Content

- Display the title, thumbnail image (if available), and a brief excerpt or description for each piece of content.
- **Bonus feature:** Explore creative ways to display additional data properties.

#### Interaction

- Clicking a card opens the featured content in a new tab.
- Mark clicked cards as read, with a visual indicator differentiating them from unread content.
- **Bonus feature:** Persist the 'read' status in the browser's local storage to maintain status across sessions.

### Technical Recommendations

- **Required:** Typescript, ReactJS.
- You may use any supporting libraries, ideally ones that can highlight your skills.

## Backend: Node.js API with NestJS

### Introduction

This challenge focuses on building a Node.js API using the NestJS framework. The API will act as a proxy to the Wikipedia Featured Content API. Additionally, it will incorporate translation features using the LibreTranslate API. This project tests your ability to create a scalable and maintainable backend service, along with your skills in API development, data validation, and integration of external services.

### Objective

Develop a Node.js API using NestJS that:

- Proxies [Wikipedia Featured Content API](https://api.wikimedia.org/wiki/Feed_API/Reference/Featured_content).
- Offers translation for titles and extracts via the [LibreTranslate API](https://libretranslate.com/) (do not pay for the API, use self-hosted).
- Ensures robust validation and error handling.

### Functional Requirements

#### Endpoints

- `/feed`
  - Acts as a proxy to the Wikipedia Featured Content API.
  - Accepts only GET requests.
  - Supports all parameters of the Wikipedia API, validating them to ensure correct types and values.
  - Defines a standard error response format for validation failures and other errors.
- `/feed/translate/#language`
  - Inherits all functionalities of the `/feed` endpoint.
  - Accepts a URL parameter specifying the target language for translation.
  - Validates the `#language` parameter to ensure it matches supported languages by the translation service.

#### Bonus Features

- Persist request logs using SQLite or another SQL server for analysis and debugging.
- Set up a local development and testing environment using Docker and docker-compose, encapsulating dependencies and configurations for easy setup and scalability.

### Technical Recommendations

- **Required:** Typescript, NestJS, Node.js.
- You may use any supporting libraries, ideally ones that can highlight your skills.

### Advance Bonus Feature: Full-stack Integration

- Combine the backend and frontend (**bonus feature:** implementing missing translation functionality in the frontend).
- E2E testing (we suggest using Crypress, but accept any other framework you may have experience with)
- Configure both frontend and backend services within a docker-compose setup, showcasing a complete, deployable application stack.
- Make the frontend run on mobile with [Capacitor](https://capacitorjs.com/).

## Evaluation Criteria

- **Code Quality:** Clarity, efficiency, and adherence to best practices are key.
- **UI/UX Design:** The application should be intuitive and aesthetically pleasing.
- **Functionality:** Must meet all functional requirements. Bonuses for additional features.
- **Unit Tests:** Coverage and effectiveness of unit tests in ensuring functionality and reliability.
- **Validation and Error Handling:** Properly handle and display errors, like API failure or data fetch issues.

## Scoring Mechanism

### Overview

The projects will be scored over 100 points each (200), distributed across various criteria. Bonus features contribute additional points, potentially exceeding the base score for exceptional work.

### Breakdown

- **Code Quality (20 points):** Code readability, efficiency, and structure.
- **UI/UX Design (15 points):** Intuitiveness, visual appeal, and user experience.
- **Functionality (30 points):** Fulfillment of the basic requirements.
- **Unit Testing (25 points total):** Coverage and effectiveness of unit tests in ensuring functionality and reliability of the application.
- **Validation and Error Handling (10 points):** Gracefully handling unexpected situations.
- **Bonus Features(10 points each):** Additional functionality.
- **Advance Bonus Features (200 points total):** Infinite scroll (+15), backend + frontend (+25), E2E testing (+40), docker-compose (+20), Mobile with Capacitor (+100).

Projects achieving over 100 points will be considered for special recognition, highlighting exceptional innovation, design, or functionality.

## Submission Instructions

- Upload the project to a public GitHub repository and share the URL by the due date specified in the email, please submit whatever you accomplished.
- Include a `README.md` with setup and running instructions, a project overview, and notes on libraries/frameworks used.
- Mention any assumptions or limitations in your implementation.
- Not submitting the project on time will immediately disqualify you as a candidate.
- Please do not introduce any commits after the submittion time, these will not be taken in consideration.
- To avoid other candidates to find and use your work, **DO NOT: fork this repo, use this file content nor the name of the company in your readme.**

## Good Luck
