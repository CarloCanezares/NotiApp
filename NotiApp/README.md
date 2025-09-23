# NotiApp

NotiApp is a mobile application built with React Native that provides users with authentication features, notification management, and a seamless user experience. This app connects to Firebase for user authentication and data storage.

## Features

- User Signup and Login
- CRUD functionalities for notifications
- Display notifications in a user-friendly interface
- Firebase integration for authentication and database management

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd NotiApp
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Add your app to the Firebase project and obtain the configuration details.
   - Update the `src/services/firebase.ts` file with your Firebase configuration.

5. Run the application:
   ```
   npm start
   ```

## Usage

- Launch the app on your mobile device or emulator.
- Use the Signup screen to create a new account.
- Log in using the Login screen.
- Manage notifications through the Notification screen.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.