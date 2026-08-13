# Control Flow Architecture Diagram

## 1. Authentication Layer
[User] -> Forms UI -> POST /api/auth/signup -> Password Hashed -> Saved to MongoDB
[User] -> Login UI -> NextAuth signIn() -> Authorize Check -> Set Session Cookies

## 2. Gameplay Loop Tier
[User] -> GameSetup -> Select Category/Difficulty -> Fetch /api/questions -> Shuffle Options -> Render QuestionCard
[User] -> QuestionCard -> Click Option -> Freeze State -> Toggle Visual Badges -> Cycle through Index until Max
[User] -> Game Summary -> Calculate Final Scoring Summary -> POST /api/scores -> Update User Dashboard Stats Matrix
