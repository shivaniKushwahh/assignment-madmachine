# Offline Webhook App

## Overview

This is a simple React application that allows you to send a POST request to a specified webhook endpoint. The app supports offline functionality: if you make a request while offline, the request is stored locally and automatically sent when you regain an internet connection.

## Features

- **Online/Offline Detection**: Displays online or offline status.
- **Offline Request Storage**: Stores requests in the browser's IndexedDB when offline.
- **Automatic Sync**: Automatically sends stored requests to the webhook endpoint when online.
- **Debounced Sync**: Ensures requests are synced only once upon reconnecting.

## Technologies Used

- **React**: For building the user interface.
- **IndexedDB**: For offline request storage.
- **Fetch API**: For sending POST requests.

## Getting Started

### Prerequisites

- **Node.js** and **npm**: Ensure you have Node.js and npm installed.

### Installation

1. **Clone the repository**:
   git clone https://github.com/shivaniKushwahh/madmachines-assignment.git
2. **Install dependencies**:
    npm install
3. **Start the development server**:
    npm start
The app will run at http://localhost:3000 or http://192.168.1.36:3000 .
