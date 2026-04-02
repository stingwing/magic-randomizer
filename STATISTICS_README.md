# Game Statistics Feature

## Overview
The Game Statistics feature provides comprehensive analytics for Magic: The Gathering Commander games. It displays detailed statistics about commanders, players, and games directly on the View page.

## Features Implemented

### 1. Commander Statistics
Displays detailed analytics for each commander used in games:
- **Commander Name**: The name of the commander
- **Times Played**: How many games this commander has been played in
- **Wins**: Number of wins with this commander
- **Draws**: Number of draws with this commander
- **Win Rate**: Percentage of games won (wins / times played)
- **Draw Rate**: Percentage of games that ended in a draw
- **Players**: List of all players who have used this commander

### 2. Player Statistics
Displays comprehensive player performance data:
- **Player Name**: The player's name
- **Games**: Total number of games played
- **Wins**: Number of games won
- **Draws**: Number of games that ended in a draw
- **Losses**: Number of games lost
- **Win Rate**: Percentage of games won (wins / total games)
- **Draw Rate**: Percentage of games that ended in a draw
- **Commanders**: Number of unique commanders played
- **Most Used Commander**: The commander the player has used the most

### 3. Summary Cards
Quick overview statistics displayed at the top:
- **Total Games**: Approximate total number of games (calculated from commander plays)
- **Total Players**: Total number of unique players
- **Unique Commanders**: Total number of different commanders used
- **Avg Games/Player**: Average number of games per player

### 4. CSV Export
Export statistics to CSV format for external analysis:
- Click the "📥 Export to CSV" button
- Exports the currently active tab (Commanders or Players)
- File is automatically downloaded with a timestamp

### 5. Multi-Event Filter (Prepared for Future)
The UI includes event filtering capability:
- Filter by specific events
- Select/deselect individual events
- Select All / Clear All buttons
- Note: Full multi-event filtering will require backend API support

## Usage

### Viewing Statistics
1. Navigate to the View page
2. Enter a room code or select a game from the history
3. Scroll down past the game rounds to the "📊 Game Statistics" section
4. Statistics will only appear if there are completed rounds

### Switching Between Tabs
- Click "🎴 Commanders" to view commander statistics
- Click "👥 Players" to view player statistics

### Exporting Data
1. Select the tab you want to export (Commanders or Players)
2. Click the "📥 Export to CSV" button
3. The file will be downloaded with a timestamped filename

## File Structure

```
src/
├── components/
│   └── GameStatistics.jsx          # Main statistics component
├── styles/
│   └── GameStatistics.styles.js    # Styles for statistics component
└── ViewPage.jsx                     # Updated to include statistics
```

## Data Flow

1. **ViewPage** fetches room data including archived rounds and current round
2. **GameStatistics** component receives:
   - `archivedRounds`: Array of completed rounds
   - `currentRound`: Current active round (if any)
   - `allRooms`: List of all available rooms (for future multi-event filtering)
3. Statistics are calculated using `useMemo` for performance
4. Data is aggregated from all groups within all rounds

## Technical Details

### Statistics Calculation

**Commander Statistics:**
- Iterates through all groups in all rounds
- Tracks each commander appearance, wins, and draws
- Calculates win/draw rates based on total plays
- Maintains a Set of unique players per commander

**Player Statistics:**
- Iterates through all groups in all rounds
- Tracks games, wins, draws, and losses per player
- Tracks unique commanders used and counts per commander
- Identifies most-used commander by frequency
- Calculates win/draw rates based on total games

**Summary Statistics:**
- Total games approximated by (total commander plays / 4)
- Total players counted from unique player names
- Total commanders counted from unique commander names
- Average games per player calculated from total games / total players

### Performance Optimizations
- `useMemo` used for all statistics calculations to prevent unnecessary recalculations
- Statistics only recalculated when `archivedRounds` or `currentRound` change
- Efficient data structures (Sets, Objects) used for aggregation

## Future Enhancements

### Planned Features
1. **Multi-Event Statistics**: 
   - Aggregate statistics across multiple selected events
   - Requires backend API support to fetch data from multiple rooms
   
2. **Event Statistics Tab**:
   - Event name, date, player count, rounds, games, draws
   - Weekly/monthly aggregations

3. **Advanced Filtering**:
   - Filter by date range
   - Filter by player
   - Filter by commander

4. **Additional Metrics**:
   - Average game length (if turn count data is available)
   - Win conditions breakdown
   - Commander color identity statistics
   - Player matchup statistics (win rate against specific players)

5. **Visualizations**:
   - Charts and graphs for statistics
   - Win rate trends over time
   - Commander popularity charts

## Styling

The component uses CSS-in-JS with the following design principles:
- Responsive table layout with horizontal scrolling on smaller screens
- Alternating row colors for better readability
- Sticky table headers
- Hover effects on interactive elements
- Consistent color scheme with the rest of the application
- Summary cards using a grid layout

## Example Output

### Commander Statistics Example
```
Commander                    | Times Played | Wins | Draws | Win Rate | Draw Rate | Players
---------------------------- | ------------ | ---- | ----- | -------- | --------- | -------------------------
Son of Rohgahh              | 30           | 10   | 3     | 33.33%   | 10.00%    | Timli, Tyler, Callum, Luis, TyTy
Sisay, Weatherlight Captain | 16           | 9    | 2     | 56.25%   | 12.50%    | Jack, Tyler, Luis
```

### Player Statistics Example
```
Player | Games | Wins | Draws | Losses | Win Rate | Draw Rate | Commanders | Most Used Commander
------ | ----- | ---- | ----- | ------ | -------- | --------- | ---------- | ---------------------------
Jack   | 16    | 9    | 2     | 5      | 56.25%   | 12.50%    | 1          | Sisay, Weatherlight Captain
Tyler  | 20    | 5    | 3     | 12     | 25.00%   | 15.00%    | 3          | Son of Rohgahh
```
