export type GameStage = 0 | 1 | 2 | 3 | 4 | 5

export type EndingType = "automated" | "lastThree" | "sabotage" | "timeout" | null

export interface DecisionRecord {
  stage: number
  choiceLabel: string
  impactLabel: string
}

export interface GameState {
  currentStage: GameStage
  timer: number
  quota: number
  quotaTarget: number
  workers: number
  humanityScore: number
  darknessLevel: number
  isRunning: boolean
  autoProductionRate: number
  isAutomated: boolean
  mistakeCount: number
  ending: EndingType
  isMinigameActive: boolean
  decisionHistory: DecisionRecord[]
}

export const INITIAL_GAME_STATE: GameState = {
  currentStage: 0,
  timer: 300, // 5 minutes in seconds
  quota: 0,
  quotaTarget: 100,
  workers: 100,
  humanityScore: 0,
  darknessLevel: 0,
  isRunning: false,
  autoProductionRate: 0,
  isAutomated: false,
  mistakeCount: 0,
  ending: null,
  isMinigameActive: false,
  decisionHistory: [],
}
