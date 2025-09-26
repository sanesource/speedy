# Internet Speed Test Webapp - Product Specification

## 1. Project Overview

### 1.1 Product Description

A real-time collaborative web application that allows users to create or join rooms where multiple participants can simultaneously test their internet connection speeds and compare results in a competitive format.

### 1.2 Core Value Proposition

- **Collaborative Testing**: Multiple users can test their internet speeds simultaneously
- **Real-time Competition**: Live comparison of connection speeds among participants
- **Easy Room Management**: Simple room creation and joining mechanism
- **Comprehensive Metrics**: Detailed speed test results with sorting capabilities

### 1.3 Target Audience

- Remote teams wanting to compare connection quality
- Gaming communities checking network performance
- Students/educators in online learning environments
- General users curious about relative internet speeds

## 2. Technical Architecture

### 2.1 Tech Stack

- **Frontend**: Next.js 14+ (React-based framework)
- **Backend**: Next.js API Routes with WebSocket server
- **Database**: MongoDB (user sessions, room data, test results)
- **Real-time Communication**: WebSockets (Socket.io)
- **Deployment**: Vercel (recommended) or similar platform

### 2.2 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│   WebSocket     │◄──►│    MongoDB      │
│   (Next.js)     │    │   Server        │    │   Database      │
│                 │    │   (Socket.io)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 3. Functional Requirements

### 3.1 User Management

- **Anonymous Users**: No registration required, users get random IDs
- **User ID Generation**: Automatic generation of unique identifiers
- **Session Management**: Temporary user sessions during room participation

### 3.2 Room Management

#### 3.2.1 Room Creation

- Any user can create a new room
- Room creator automatically becomes admin
- System generates unique 6-8 character room ID
- Room ID should be shareable and easy to communicate

#### 3.2.2 Room Joining

- Users can join via room ID input
- Maximum capacity: 8 participants per room
- Real-time participant list updates
- Prevent joining when room is full

#### 3.2.3 Room States

- **Waiting**: Room created, waiting for participants
- **Ready**: 2+ participants, admin can start game
- **Testing**: Speed test in progress
- **Results**: Displaying test results
- **Closed**: Game completed, users can exit

### 3.3 Access Control

#### 3.3.1 Admin Privileges

- Start the speed test when 2+ participants present
- Control game flow and timing
- Ability to kick users (optional enhancement)

#### 3.3.2 User Privileges

- View participant list
- Participate in speed tests
- View and sort results
- Exit room at any time

### 3.4 Speed Testing Engine

#### 3.4.1 Test Parameters

- **Download Speed**: Measured in Mbps
- **Upload Speed**: Measured in Mbps
- **Latency**: Round-trip time in milliseconds
- **Ping**: Connection response time in milliseconds
- **Jitter**: Connection stability metric (optional)

#### 3.4.2 Test Execution

- Simultaneous testing for all participants
- Standardized test duration (30-60 seconds)
- Real-time progress indicators
- Consistent test servers/methodology for fair comparison

#### 3.4.3 Test Implementation Options

1. **Client-side JavaScript libraries** (fast.com API, speedtest.net API)
2. **Custom implementation** using file downloads/uploads
3. **Third-party service integration**

### 3.5 Results Display

#### 3.5.1 Results Table

- Username/User ID column
- Download speed column
- Upload speed column
- Latency column
- Ping column
- Timestamp of test completion

#### 3.5.2 Sorting Functionality

- Clickable column headers
- Ascending/descending sort options
- Visual indicators for sort direction
- Default sort by download speed (highest first)

#### 3.5.3 Additional Features

- Highlight best/worst performers
- Speed rankings or positions
- Export results option (CSV/JSON)

## 4. User Experience Flow

### 4.1 User Journey - Room Creator

1. **Landing Page**: Enter username (optional) or use generated ID
2. **Create Room**: Click "Create Room" → Get room ID
3. **Share Room**: Copy and share room ID with others
4. **Wait for Participants**: See real-time participant list
5. **Start Game**: When 2+ users present, click "Start Speed Test"
6. **Participate in Test**: Run speed test simultaneously
7. **View Results**: See comparative results table
8. **Exit**: Leave room when done

### 4.2 User Journey - Room Joiner

1. **Landing Page**: Enter username (optional) and room ID
2. **Join Room**: Click "Join Room" → Enter room
3. **Wait for Start**: See other participants, wait for admin to start
4. **Participate in Test**: Run speed test when initiated
5. **View Results**: See comparative results table
6. **Exit**: Leave room when done

## 5. User Interface Specifications

### 5.1 Landing Page

- **Clean, minimal design** with clear call-to-action buttons
- **Two main options**: "Create Room" and "Join Room"
- **Optional username field** with auto-generated fallback
- **Recent rooms list** (if applicable)

### 5.2 Room Waiting Area

- **Room ID display** with copy button
- **Participant list** with real-time updates
- **Role indicators** (Admin/User badges)
- **Start button** (admin only, enabled with 2+ users)
- **Room capacity indicator** (e.g., "3/8 participants")

### 5.3 Speed Test Interface

- **Progress indicators** for each participant
- **Real-time status updates** ("Testing download speed...")
- **Visual progress bars** or loading animations
- **Estimated time remaining**

### 5.4 Results Page

- **Sortable data table** with clear column headers
- **Performance indicators** (color coding, badges)
- **Action buttons** (New Test, Export, Exit Room)
- **Summary statistics** (average speeds, best performer)

## 6. WebSocket Events Specification

### 6.1 Connection Events

```javascript
// Client connects
'connection' → Server assigns user ID

// User disconnection
'disconnect' → Update room participant list
```

### 6.2 Room Management Events

```javascript
// Room creation
'create-room' → { userId, username }
'room-created' → { roomId, adminId }

// Room joining
'join-room' → { roomId, userId, username }
'user-joined' → { userId, username, participantCount }
'room-full' → Error message

// Room updates
'participant-list-update' → { participants[] }
'user-left' → { userId, remainingParticipants }
```

### 6.3 Game Flow Events

```javascript
// Game start
'start-speed-test' → Initiate test for all participants
'test-started' → Begin client-side speed testing

// Test progress
'test-progress' → { userId, progress, currentMetric }
'test-completed' → { userId, results }

// Results
'all-results-ready' → { allResults[], timestamp }
'display-results' → Show results table
```

## 7. Database Schema

### 7.1 Rooms Collection

```javascript
{
  _id: ObjectId,
  roomId: String, // Unique 6-8 char identifier
  adminId: String, // User ID of room creator
  participants: [
    {
      userId: String,
      username: String,
      joinedAt: Date,
      isActive: Boolean
    }
  ],
  status: String, // 'waiting', 'testing', 'completed', 'closed'
  createdAt: Date,
  maxCapacity: Number, // Default: 8
  testResults: [
    {
      userId: String,
      downloadSpeed: Number,
      uploadSpeed: Number,
      latency: Number,
      ping: Number,
      testedAt: Date
    }
  ]
}
```

### 7.2 User Sessions Collection

```javascript
{
  _id: ObjectId,
  userId: String, // Unique identifier
  username: String,
  currentRoom: String, // Room ID if in a room
  createdAt: Date,
  lastActive: Date,
  socketId: String // Current WebSocket connection ID
}
```

## 8. Technical Implementation Details

### 8.1 Room ID Generation

- Use crypto-safe random generation
- Ensure uniqueness across active rooms
- 6-character alphanumeric (avoiding confusing characters)
- Check against existing rooms before assignment

### 8.2 WebSocket Connection Management

- Handle connection drops and reconnections
- Maintain user state across brief disconnections
- Clean up rooms when all users leave
- Implement heartbeat/ping for connection monitoring

### 8.3 Speed Test Implementation

- Use reliable third-party APIs (Fast.com, Speedtest.net)
- Implement fallback testing methods
- Ensure consistent test conditions for all users
- Handle test failures gracefully

### 8.4 Real-time Synchronization

- Ensure all participants see consistent room state
- Handle race conditions in room joining/leaving
- Implement optimistic updates with error handling
- Manage test timing synchronization

## 9. Performance Requirements

### 9.1 Response Times

- **Room creation/joining**: < 2 seconds
- **Real-time updates**: < 500ms
- **Speed test initiation**: < 3 seconds
- **Results display**: < 2 seconds

### 9.2 Scalability

- Support 100+ concurrent rooms
- Handle 800+ simultaneous users (100 rooms × 8 users)
- Efficient WebSocket connection management
- Database query optimization

### 9.3 Reliability

- 99%+ uptime for core functionality
- Graceful handling of network interruptions
- Data persistence across server restarts
- Error recovery mechanisms

## 10. Security Considerations

### 10.1 Data Privacy

- No permanent storage of personal information
- Temporary session data only
- Secure WebSocket connections (WSS)
- No sensitive data transmission

### 10.2 Room Security

- Prevent unauthorized access to rooms
- Rate limiting on room creation
- Protection against spam/abuse
- Safe room ID generation

### 10.3 Input Validation

- Sanitize all user inputs
- Validate room IDs and user IDs
- Prevent XSS attacks
- WebSocket message validation

## 11. Future Enhancements

### 11.1 Phase 2 Features

- User accounts and login system
- Room passwords/private rooms
- Historical test results
- Custom test durations
- Mobile app version

### 11.2 Advanced Features

- Voice/video chat during tests
- Team-based competitions
- Leaderboards and achievements
- Integration with popular speed test services
- Advanced analytics and reporting

## 12. Development Timeline

### 12.1 Phase 1 (MVP) - 4-6 weeks

- **Week 1-2**: Project setup, database schema, basic UI
- **Week 3-4**: WebSocket implementation, room management
- **Week 5-6**: Speed testing integration, results display

### 12.2 Phase 2 (Polish) - 2-3 weeks

- Testing, bug fixes, performance optimization
- UI/UX improvements
- Documentation and deployment

## 13. Success Metrics

### 13.1 User Engagement

- Average session duration
- Rooms created per day
- Tests completed successfully
- User return rate

### 13.2 Technical Performance

- WebSocket connection stability
- Speed test completion rate
- Response time metrics
- Error rates

---

This specification provides a comprehensive foundation for developing your internet speed testing webapp. The modular design allows for iterative development and future enhancements while maintaining focus on the core competitive speed testing experience.
