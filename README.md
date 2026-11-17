# Electrico – Sibuyan Blackout Tracker

CRUD web app: residents report power outages in Sibuyan, and Electrico shows the hours and days when outages happen most.
Backend: Node.js + Express.js | Database: MongoDB (Mongoose) | Version control: GitHub | Deployment: Render

## API
| Method | Route | Operation |
|---|---|---|
| POST | /api/reports | Create a report |
| GET | /api/reports | Read all reports |
| PUT | /api/reports/:id | Update a report |
| DELETE | /api/reports/:id | Delete a report |

## Run locally
1. Install Node.js 18 or newer.
2. `npm install`
3. Copy `.env.example` to `.env` and put your MongoDB Atlas connection string in `MONGODB_URI`.
4. `npm start`, then open http://localhost:3000

## Deploy on Render
New > Web Service > connect the GitHub repo. Build command `npm install`, start command `npm start`.
Add the environment variable `MONGODB_URI` (same value as in `.env`).
In MongoDB Atlas > Network Access, allow access from anywhere (0.0.0.0/0).
