export enum MessageSender {
  USER = 'USER',
  AI = 'AI',
}

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
}

export enum AvatarState {
    IDLE = 'IDLE',
    LISTENING = 'LISTENING',
    THINKING = 'THINKING',
    SPEAKING = 'SPEAKING',
}
