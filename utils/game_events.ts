export interface TeamDetails {
  id: string
  name: string
  series_score: number
  score: number
  score_ct: number
  score_t: number
  side: string
}

export interface BaseEvent {
  event: string
  matchId: string
}

//Match end
export interface MapResultEvent extends BaseEvent {
  map_number: number
  team1: TeamDetails
  team2: TeamDetails
  winner: object
}

// Match start
export interface MatchGoingLiveEvent extends BaseEvent {
  map_number: number
}

//Score update
export interface RoundEndEvent extends BaseEvent {
  map_number: number
  round_number: number
  round_time: number
  reason: number
  winner: object
  team1: TeamDetails
  team2: TeamDetails
}
