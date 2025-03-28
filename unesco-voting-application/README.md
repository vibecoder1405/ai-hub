# UNESCO India Heritage Voting App

A modern web application that allows users to vote on their favorite UNESCO India Heritage sites through an engaging matchup system. Built with React, Express, and TypeScript.

## 🌟 Features

- **Interactive Matchups**: Vote between two UNESCO India Heritage sites
- **Real-time Statistics**: View voting trends and site popularity
- **Recent Votes**: Track the latest voting activity
- **Modern UI**: Built with React and styled with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Database Integration**: PostgreSQL with Drizzle ORM
- **Development Experience**: Hot Module Replacement with Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/UnescoVotingApp.git
cd UnescoVotingApp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your database credentials and other configuration.

4. Set up the database:
```bash
npm run db:push
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## 🏗️ Project Structure

```
UnescoVotingApp/
├── client/           # React frontend components
├── server/           # Express backend server
├── shared/           # Shared types and utilities
├── dist/            # Production build output
└── public/          # Static assets
```

## 🛠️ Tech Stack

- **Frontend**:
  - React
  - TypeScript
  - Tailwind CSS
  - Radix UI Components
  - React Query
  - Wouter (Routing)

- **Backend**:
  - Express
  - TypeScript
  - PostgreSQL
  - Drizzle ORM
  - Passport.js (Authentication)

- **Development**:
  - Vite
  - ESBuild
  - TypeScript
  - Tailwind CSS

## 📝 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
HOST=127.0.0.1
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Session Configuration
SESSION_SECRET=your-session-secret-here
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- UNESCO for providing the World Heritage sites data
- All contributors who help improve this project
- The open-source community for the amazing tools and libraries used in this project

## 📞 Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.

## 🔄 Roadmap

- [ ] Add user authentication
- [ ] Implement social sharing
- [ ] Add more detailed site information
- [ ] Create an admin dashboard
- [ ] Add internationalization support
- [ ] Implement progressive web app features

## 📊 Project Status

This project is actively maintained and open for contributions. We welcome bug reports, feature requests, and pull requests.

---

Made with ❤️ by [Your Name] 