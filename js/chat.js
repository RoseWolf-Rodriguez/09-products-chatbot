// Get your API key from secrets.js
// Make sure to include secrets.js before this file in your HTML

// Select chat form, input, and chat display container from the DOM
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatContainer = document.getElementById('chat-container');

// Store the conversation as an array of messages
let conversation = [];

// Listen for form submission
chatForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent page reload

  // Get the user's message
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  // Add user's message to the conversation
  conversation.push({ role: "user", content: userMessage });

  // Display user's message in the chat
  addMessageToChat("You", userMessage);

  // Clear the input field
  chatInput.value = "";

  // Send the conversation to OpenAI and get the AI's response
  const aiMessage = await getAIResponse(conversation);

  // Add AI's message to the conversation
  conversation.push({ role: "assistant", content: aiMessage });

  // Display AI's message in the chat
  addMessageToChat("AI", aiMessage);
});

// Function to display a message in the chat container
function addMessageToChat(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-message';
  messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
}

// Function to call OpenAI's GPT-4o API and get a response
async function getAIResponse(messages) {
  // Show a loading message
  addMessageToChat("AI", "Thinking...");

  // Prepare the API request
  const url = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}` // apiKey is from secrets.js
  };
  const body = {
    model: "gpt-4o",
    messages: messages
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    });
    const data = await response.json();

    // Remove the loading message
    const loadingMessages = chatContainer.querySelectorAll('.chat-message');
    if (loadingMessages.length > 0) {
      chatContainer.removeChild(loadingMessages[loadingMessages.length - 1]);
    }

    // Get the AI's reply from the API response
    return data.choices[0].message.content.trim();
  } catch (error) {
    // Remove the loading message
    const loadingMessages = chatContainer.querySelectorAll('.chat-message');
    if (loadingMessages.length > 0) {
      chatContainer.removeChild(loadingMessages[loadingMessages.length - 1]);
    }
    return "Sorry, there was an error getting a response from the AI.";
  }
}