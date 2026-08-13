# Core Database Entities Schema Mapping

## User Schema
* `username`: String (Unique, Required, Trimmed)
* `email`: String (Unique, Required, Lowercase, Checked via Regex Pattern)
* `passwordHash`: String (Required)
* `gamesPlayed`: Number (Default: 0)
* `highScore`: Number (Default: 0)
* `statsByCategory`: Map (Dynamic Keys mapping to `{ correct, total }`)
* `statsByDifficulty`: Fixed Object containing sub-documents for `easy`, `medium`, and `hard` profiles.

## Score Schema
* `userId`: String (Required, Relational link mapping `ref: "User"`)
* `categoryId`: String (Required)
* `difficulty`: String (Required)
* `score`: Number (Required, Boundary tracking `min: 0`)
* `totalQuestions`: Number (Required, Boundary tracking `min: 1`)
* `createdAt`: Date (Default: Date.now)
