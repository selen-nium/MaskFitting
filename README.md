# Mask Fitting System

## Description
A web-based application designed for hospitals to manage and track mask fittings for their staff. It features user authentication, a health declaration form, and a dashboard for managing mask fitting data.


## Technologies Used
- Frontend: React.js
- Backend: Express.js
- Database and Authentication: Firebase

## Installation

### Prerequisites
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Steps
1. Clone the repository
```
git clone https://github.com/your-username/mask-fitting-system.git
cd mask-fitting-system
```
or 
click the green code button
click SSH
copy the link
clone it in your IDE

2. Install backend dependencies
```
cd backend
npm install
```
2. Install frontend dependencies
```
cd ../frontend
npm install
```
4. Start backend server
```
cd ../backend
npm start
```
5. Start frontend server
```
cd ../frontend
npm start
```


## Resources to be acquired
1.  Mask wearing videos (in frontend/src/components/maskwearing/MaskWearing.jsx)
```
const videoSources = {
    '3m-8110s-8210': '/videos/3m-8110s-8210-instructions.mp4',
    '3m-1870-plus': '/videos/3m-1870-plus-instructions.mp4',
    'air-plus': '/videos/air-plus-instructions.mp4',
    'halyard': '/videos/halyard-instructions.mp4'
};
```

2. Videos for Exercises (kiv)


## Moving on
1. Change to actual database (the firebaseAdmin.json file in backend config is not pushed to git for security reasons)

2. UIUX fixes

3. Connect to NTU email system for verification/password resets

