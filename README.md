# URL Shortener API

A scalable URL shortener service with advanced analytics, Google Sign-In authentication, and rate limiting capabilities. This service allows users to create and manage short URLs, track their performance, and analyze usage patterns across different platforms and devices.

## Features

- **User Authentication**

  - Google Sign-In integration
  - Secure user registration and authentication

- **URL Management**

  - Create short URLs with optional custom aliases
  - Group URLs by topics (acquisition, activation, retention)
  - Automatic URL validation and processing

- **Advanced Analytics**

  - Track total and unique clicks
  - Device and OS statistics
  - Temporal analysis (7-day history)
  - Topic-based performance metrics
  - Overall usage statistics

- **Performance & Security**
  - Redis caching implementation
  - Rate limiting protection
  - Scalable database design

## Technology Stack

- **Backend**: Node.js
- **Database**: MongoDB Atlas
- **Caching**: Redis
- **Authentication**: Google OAuth 2.0
- **Deployment**: Docker, Render.com

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Redis
- Docker and Docker Compose
- Google Developer Console account (for OAuth)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
MONGODB_URI=your_mongodb_atlas_uri
REDIS_URL=redis://localhost:6379
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PORT=3000
```

## Running the Application

### Local Development

```bash
# Start Redis (if running locally)
docker run -d -p 6379:6379 redis:alpine

# Start the application
npm run dev
```

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## API Endpoints

### Authentication

- `POST /auth/google` - Google Sign-In authentication (EXECUTE IN BROWSER)

### URL Operations

- `POST /api/shorten` - Create short URL

  ```json
  {
    "longUrl": "https://example.com/very/long/url",
    "customAlias": "custom-name",
    "topic": "acquisition"
  }
  ```

- `GET /api/{alias}` - Redirect to original URL

### Analytics

- `GET /api/analytics/{alias}` - Get specific URL analytics
- `GET /api/analytics/topic/{topic}` - Get topic-based analytics
- `GET /api/analytics/overall` - Get overall analytics

## Deployment

### Render.com Deployment

1. Create a Render account and connect your GitHub repository
2. Set up a Web Service with these settings:

   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. Configure environment variables in Render dashboard
4. Deploy Redis service through Render
5. Update REDIS_URL in your web service configuration

### Environment Variables for Production

```
MONGODB_URI=your_mongodb_atlas_uri
REDIS_URL=your_render_redis_url
NODE_ENV=production
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Rate Limiting

- API endpoints: 100 requests per 15 minutes per user
- URL creation: 100 requests per hour per user
- Analytics endpoints: 300 requests per 15 minutes per user

## Monitoring & Maintenance

- Monitor application logs through Render dashboard
- Check Redis cache hit rates
- Monitor MongoDB Atlas metrics
- Review analytics data for system performance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
