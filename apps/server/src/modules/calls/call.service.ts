import { CallRequestPayload } from "./call.types.js";

// Dummy service for Day 6. In the future, we can save call logs to PostgreSQL here.
export class CallService {
  async validateCallRequest(payload: CallRequestPayload, callerId: string): Promise<boolean> {
    // Add logic here to check if callerId is allowed to call receiverId (e.g. they are friends or in the same conversation)
    return true; 
  }
}

export const callService = new CallService();
