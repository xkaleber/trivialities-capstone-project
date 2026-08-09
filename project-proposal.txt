Project Proposal: Trivia Game App - “Trivialities”

Tech Stack
Frontend (Mobile & Web):
NextJS: 
React: For building an interactive web application and ensuring a smooth and positive user experience across platforms.

Backend:
Node.js: For handling API requests, server-side logic and integration with the database

Database:
MongoDB: For data collection.
Mongoose: For connecting and accessing database collections.

Hosting:
Vercel or Netlifly
Amazon Cloud or Google Cloud

Focus of the Project
“Trivialities” will be an evenly focused full-stack application, implementing both frontend and backend components. 

Project Type
Mobile App: Cross-platform application for iOS and Android.
Website: A web application accessible through modern browsers.

Project Goal
The goal of the project is to provide a dynamic, competitive, and fun trivia game for users to enjoy alone, or with groups of people.

User Demographic
The primary users of the app will be:

Casual gamers: Individuals who enjoy variety games in their spare time.
Trivia enthusiasts: Individuals who love trivia and knowledge games.
Competitive gamers: Individuals who love to compete with other people.

Data and API
Data: The content will include questions and answers from a variety of categories and 3 difficulty levels (Easy, Medium, Hard)
Data Collection: Content will be delivered via the Open Trivia Database API to both mobile and app and website.

Project Approach
Database Schema
Models:
Users: Stores information about users (username, email, passwordHash, gamesPlayed, highScore, statsByCategory, statsByDifficulty (easy, medium, hard))
Questions: Wil be sourced from the OpenTriviaDB API.
Score: Stores the score for each match played (userID, categoryID, difficulty, score, totalQuestions, createdAt)

Potential API Issues.
Data Consistency: Making sure content is consistently delivered across platforms.
Scalability: Handling increasing amounts of data and user requests efficiently.
Error Handling: Managing and reporting API errors to ensure a smooth user experience.

Sensitive Information: Sensitive information such as passwords will be hashed using bcryptjs.

Functionality
Content Display: Users can view and select the different categories they want to play
Core Gameplay: Variety of different categories, across 3 levels of difficulty (Easy, Medium, Hard)
User Engagement: 
User profiles to track progress and stats.
Leaderboards to foster competition 

User Flow
Pregame:

Welcome Screen: Displays login and registration options.
If the user is registered, they will choose login and be sent to the login screen.
If they are not registered, they will choose register and be sent to the registration screen.  After, registration, they will be sent to the login screen.
After login, they will be shown 5 featured categories to choose and navigate to.
After a category is chosen, the game will begin.

Gameplay:
Start Game: The game starts and the timer begins after a category is selected on the welcome screen. 
Question Presentation: Users are presented with a question and a set of multiple choice answers.
Answering: Users will select an answer.
Feedback: The game immediately tells the user if their answer is correct or not, shows the correct answer, and provides an option to move to the next question.
Next Question: The flow progresses to the next question, repeating the process.

Post-Game:
End of Game: After all questions are answered, the game ends.
Results/Leaderboard: A results screen displays the user’s final score and shows the leaderboard with top performers.

Stretch Goals
Friends’ invitations and social media integration
Reward System
Team games where two teams choose a captain and go head to head.