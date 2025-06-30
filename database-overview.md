# IntelliGuide Dashboard Database Structure Overview

## Project Information
- **Project**: IntelliGuide Dashboard (ASP.NET Core 8.0)
- **Current Setup**: API originally used MySQL connection
- **Target**: Migrate to SQLite in-memory database
- **Purpose**: This document provides the complete database structure for recreating the schema in SQLite

## Database Tables and Relationships

### 1. Users Table
**Purpose**: Stores user account information

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| user_id | VARCHAR(255) | PRIMARY KEY, NOT NULL | Unique identifier for user |
| username | VARCHAR(255) | NOT NULL | User's login username |
| name | VARCHAR(255) | NULL | User's display name |
| place | VARCHAR(255) | NULL | User's location |
| image | VARCHAR(255) | NULL | URL/path to user's profile image |

**SQLite DDL:**
```sql
CREATE TABLE users (
    user_id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL,
    name TEXT,
    place TEXT,
    image TEXT
);
```

### 2. Events Table
**Purpose**: Stores event information

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| event_id | VARCHAR(255) | PRIMARY KEY, NOT NULL | Unique identifier for event |
| user_id | VARCHAR(255) | NULL, FOREIGN KEY | Reference to users.user_id |
| name | VARCHAR(255) | NULL | Event name |
| description | TEXT | NULL | Event description |
| address | VARCHAR(500) | NULL | Event address |
| place | VARCHAR(255) | NULL | Event venue/place |
| time | DATETIME | NULL | Event date and time |

**SQLite DDL:**
```sql
CREATE TABLE events (
    event_id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    name TEXT,
    description TEXT,
    address TEXT,
    place TEXT,
    time DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 3. Bots Table
**Purpose**: Stores chatbot configurations

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| bot_id | VARCHAR(255) | PRIMARY KEY, NOT NULL | Unique identifier for bot |
| user_id | VARCHAR(255) | NULL, FOREIGN KEY | Reference to users.user_id |
| event_id | VARCHAR(255) | NULL, FOREIGN KEY | Reference to events.event_id |
| name | VARCHAR(255) | NULL | Bot display name |
| avatar | VARCHAR(255) | NULL | URL/path to bot avatar |
| style | VARCHAR(255) | NULL | Bot conversation style |
| voice | VARCHAR(255) | NULL | Bot voice configuration |
| greeting | TEXT | NULL | Bot greeting message |
| location | VARCHAR(255) | NULL | Bot location |
| status | VARCHAR(50) | NULL | Bot status (active/inactive) |

**SQLite DDL:**
```sql
CREATE TABLE bots (
    bot_id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    event_id TEXT,
    name TEXT,
    avatar TEXT,
    style TEXT,
    voice TEXT,
    greeting TEXT,
    location TEXT,
    status TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);
```

### 4. Conversations Table
**Purpose**: Stores conversation sessions between users and bots

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| conversation_id | VARCHAR(255) | PRIMARY KEY, NOT NULL | Unique identifier for conversation |
| bot_id | VARCHAR(255) | NOT NULL, FOREIGN KEY | Reference to bots.bot_id |
| time | DATETIME | NOT NULL | Conversation start time |
| review | INTEGER | NULL | User rating (1-5 scale) |
| comment | TEXT | NULL | User feedback comment |

**SQLite DDL:**
```sql
CREATE TABLE conversations (
    conversation_id TEXT PRIMARY KEY NOT NULL,
    bot_id TEXT NOT NULL,
    time DATETIME NOT NULL,
    review INTEGER,
    comment TEXT,
    FOREIGN KEY (bot_id) REFERENCES bots(bot_id)
);
```

### 5. Messages Table
**Purpose**: Stores individual messages within conversations

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| message_id | VARCHAR(255) | PRIMARY KEY, NOT NULL | Unique identifier for message |
| conversation_id | VARCHAR(255) | NOT NULL, FOREIGN KEY | Reference to conversations.conversation_id |
| type | VARCHAR(50) | NOT NULL | Message type (user/bot/system) |
| time | DATETIME | NOT NULL | Message timestamp |
| body | TEXT | NOT NULL | Message content |

**SQLite DDL:**
```sql
CREATE TABLE messages (
    message_id TEXT PRIMARY KEY NOT NULL,
    conversation_id TEXT NOT NULL,
    type TEXT NOT NULL,
    time DATETIME NOT NULL,
    body TEXT NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
);
```

### 6. Context Table
**Purpose**: Stores contextual information for bots

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| context_id | VARCHAR(255) | PRIMARY KEY | Unique identifier for context |
| bot_id | VARCHAR(255) | NULL, FOREIGN KEY | Reference to bots.bot_id |
| title | VARCHAR(255) | NULL | Context title |
| body | TEXT | NULL | Context content |
| status | VARCHAR(50) | NULL | Context status |

**SQLite DDL:**
```sql
CREATE TABLE context (
    context_id TEXT PRIMARY KEY,
    bot_id TEXT,
    title TEXT,
    body TEXT,
    status TEXT,
    FOREIGN KEY (bot_id) REFERENCES bots(bot_id)
);
```

### 7. Help Table
**Purpose**: Stores help requests and support tickets

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| help_id | VARCHAR(255) | PRIMARY KEY, NOT NULL | Unique identifier for help request |
| bot_id | VARCHAR(255) | NOT NULL, FOREIGN KEY | Reference to bots.bot_id |
| message | TEXT | NULL | Help request message |
| time | DATETIME | NOT NULL | Request timestamp |
| opened | VARCHAR(50) | NOT NULL | Status (open/closed/pending) |

**SQLite DDL:**
```sql
CREATE TABLE help (
    help_id TEXT PRIMARY KEY NOT NULL,
    bot_id TEXT NOT NULL,
    message TEXT,
    time DATETIME NOT NULL,
    opened TEXT NOT NULL,
    FOREIGN KEY (bot_id) REFERENCES bots(bot_id)
);
```

## Complete SQLite Database Schema

```sql
-- Create all tables with proper relationships
CREATE TABLE users (
    user_id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL,
    name TEXT,
    place TEXT,
    image TEXT
);

CREATE TABLE events (
    event_id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    name TEXT,
    description TEXT,
    address TEXT,
    place TEXT,
    time DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE bots (
    bot_id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    event_id TEXT,
    name TEXT,
    avatar TEXT,
    style TEXT,
    voice TEXT,
    greeting TEXT,
    location TEXT,
    status TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);

CREATE TABLE conversations (
    conversation_id TEXT PRIMARY KEY NOT NULL,
    bot_id TEXT NOT NULL,
    time DATETIME NOT NULL,
    review INTEGER,
    comment TEXT,
    FOREIGN KEY (bot_id) REFERENCES bots(bot_id)
);

CREATE TABLE messages (
    message_id TEXT PRIMARY KEY NOT NULL,
    conversation_id TEXT NOT NULL,
    type TEXT NOT NULL,
    time DATETIME NOT NULL,
    body TEXT NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
);

CREATE TABLE context (
    context_id TEXT PRIMARY KEY,
    bot_id TEXT,
    title TEXT,
    body TEXT,
    status TEXT,
    FOREIGN KEY (bot_id) REFERENCES bots(bot_id)
);

CREATE TABLE help (
    help_id TEXT PRIMARY KEY NOT NULL,
    bot_id TEXT NOT NULL,
    message TEXT,
    time DATETIME NOT NULL,
    opened TEXT NOT NULL,
    FOREIGN KEY (bot_id) REFERENCES bots(bot_id)
);
```

## Relationships Overview

1. **Users** → **Events** (One-to-Many): A user can create multiple events
2. **Users** → **Bots** (One-to-Many): A user can own multiple bots
3. **Events** → **Bots** (One-to-Many): An event can have multiple bots
4. **Bots** → **Conversations** (One-to-Many): A bot can have multiple conversations
5. **Bots** → **Context** (One-to-Many): A bot can have multiple context entries
6. **Bots** → **Help** (One-to-Many): A bot can have multiple help requests
7. **Conversations** → **Messages** (One-to-Many): A conversation contains multiple messages

## Sample Data for Testing

```sql
-- Sample Users
INSERT INTO users VALUES ('user1', 'john_doe', 'John Doe', 'Amsterdam', '/images/john.jpg');
INSERT INTO users VALUES ('user2', 'jane_smith', 'Jane Smith', 'Rotterdam', '/images/jane.jpg');

-- Sample Events
INSERT INTO events VALUES ('event1', 'user1', 'Tech Conference 2025', 'Annual technology conference', 'Convention Center Amsterdam', 'Amsterdam', '2025-07-15 09:00:00');
INSERT INTO events VALUES ('event2', 'user2', 'Art Exhibition', 'Modern art showcase', 'Museum Rotterdam', 'Rotterdam', '2025-08-20 10:00:00');

-- Sample Bots
INSERT INTO bots VALUES ('bot1', 'user1', 'event1', 'TechBot', '/avatars/tech.png', 'professional', 'neutral', 'Welcome to the Tech Conference!', 'Amsterdam', 'active');
INSERT INTO bots VALUES ('bot2', 'user2', 'event2', 'ArtBot', '/avatars/art.png', 'creative', 'friendly', 'Hello! Welcome to our art exhibition!', 'Rotterdam', 'active');
```

## Notes for Implementation

1. **Data Types**: SQLite uses dynamic typing, so TEXT is used for VARCHAR fields
2. **DateTime**: SQLite stores dates as TEXT, INTEGER, or REAL - using TEXT format (ISO8601)
3. **Foreign Keys**: Must be enabled in SQLite with `PRAGMA foreign_keys = ON;`
4. **Indexing**: Consider adding indexes on frequently queried columns like bot_id, user_id, conversation_id
5. **In-Memory**: For in-memory database use connection string: `Data Source=:memory:`

## Migration Considerations

- All ID fields use string/text types (UUIDs or custom identifiers)
- Nullable fields are properly marked
- Relationships maintain referential integrity
- Consider adding created_at/updated_at timestamps if audit trail is needed
- Review field lengths based on actual data requirements
