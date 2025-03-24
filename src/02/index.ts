// Load environment variables from .env file  
import dotenv from 'dotenv';
dotenv.config();
// Langchain Language Model
import { ChatOpenAI } from "@langchain/openai";
// Langchain Core
import { MessageContent } from "@langchain/core/messages";
// Langchain LangGraph
import {
    START,
    END,
    MessagesAnnotation,
    StateGraph,
    MemorySaver,
} from "@langchain/langgraph";
// Utils
import { v4 as uuid } from "uuid";

const llm = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    temperature: 0
});
const callModel = async (state: typeof MessagesAnnotation.State) => {
    const response = await llm.invoke(state.messages);
    return { messages: response };
};

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
    // Define the node and edge
    .addNode("model", callModel)
    .addEdge(START, "model")
    .addEdge("model", END);

// Add memory
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });


async function chatBot(payload: { content: string, userId: string, conversationId: string }): Promise<MessageContent> {
    const { content, userId, conversationId } = payload;

    const config = getChatConfig({ userId, conversationId });
    const input = [
        {
            role: "user",
            content,
        },
    ];

    const output = await app.invoke({ messages: input }, config);

    return output.messages[output.messages.length - 1].content;
}

function getChatConfig(payload: { userId: string, conversationId: string }) {
    const { conversationId, userId } = payload;

    return { configurable: { thread_id: `${conversationId}-${userId}` } };
}

const user = {
    id: uuid(),
    conversations: [{
        id: uuid(),
        title: "Conversation 1",
    }]
};
const message1 = "Hello, My name is Bob";
const response1 = await chatBot({ content: message1, userId: user.id, conversationId: user.conversations[0].id });
console.log("message1:", message1);
console.log("response1:", response1);

const message2 = "Do you know my name?";
const response2 = await chatBot({ content: message2, userId: user.id, conversationId: user.conversations[0].id });
console.log("message2:", message2);
console.log("response2:", response2);