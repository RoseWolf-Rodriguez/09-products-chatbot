// Main function to initialize the chat interface
function initChat() {
    // Get all required DOM elements
    const chatToggle = document.getElementById('chatToggle');
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');
    const openIcon = document.querySelector('.open-icon');
    const closeIcon = document.querySelector('.close-icon');

    // Store the conversation as an array of messages
    let conversation = [];

    // Load rentals.json data once and store it
    let rentalsData = null;
    fetch('./rentals.json')
        .then(response => response.json())
        .then(data => {
            rentalsData = data;
        });

    // Toggle chat visibility and swap icons
    chatToggle.addEventListener('click', function() {
        chatBox.classList.toggle('active');
        openIcon.style.display = chatBox.classList.contains('active') ? 'none' : 'block';
        closeIcon.style.display = chatBox.classList.contains('active') ? 'block' : 'none';
    });

    // Function to add a message to the chat window
    function addMessageToChat(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user' : 'bot');
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to get AI response from OpenAI API
    async function getAIResponse(messages) {
        // Show a loading message
        addMessageToChat('bot', 'Thinking...');

        // Prepare the system prompt with rental data and conversation guidance
        const systemPrompt = `You are a friendly vacation rental assistant.
Guide the user through a short conversation by asking 2–3 simple questions to help match them to a rental from the list below.
Ask one question at a time, such as their preferred location, type of experience, or rating.
After getting enough information, recommend the top 1–2 rentals that best fit their answers, using only the rentals provided below.

When responding, use a natural and conversational tone. Format your responses clearly using line breaks or bullet points. Use Markdown formatting for lists and recommendations to make your answers easy to read.

Here are the available rentals:
${JSON.stringify(rentalsData.rentals, null, 2)}
`;

        // Build the messages array for the API
        const apiMessages = [
            { role: "system", content: systemPrompt },
            ...messages
        ];

        // Prepare the API request
        const url = "https://api.openai.com/v1/chat/completions";
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}` // apiKey comes from secrets.js
        };
        const body = {
            model: "gpt-4o",
            messages: apiMessages,
            max_tokens: 800, // Limit response length
            top_p: 1.0, // Use nucleus sampling
            frequency_penalty: 0.0, // No penalty for repeated phrases
            presence_penalty: 0.0, // No penalty for new topics
            temperature: 0.7 // Adjust creativity level
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body)
            });
            const data = await response.json();

            // Remove the loading message
            const loadingMessages = chatMessages.querySelectorAll('.message.bot');
            if (loadingMessages.length > 0) {
                chatMessages.removeChild(loadingMessages[loadingMessages.length - 1]);
            }

            // Get the AI's reply
            return data.choices[0].message.content.trim();
        } catch (error) {
            // Remove the loading message
            const loadingMessages = chatMessages.querySelectorAll('.message.bot');
            if (loadingMessages.length > 0) {
                chatMessages.removeChild(loadingMessages[loadingMessages.length - 1]);
            }
            return "Sorry, there was an error getting a response from the AI.";
        }
    }

    // Handle user input and process messages
    async function handleUserInput(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            userInput.value = '';

            // Add user's message to conversation and display it
            conversation.push({ role: "user", content: message });
            addMessageToChat('user', message);

            // Get AI response and display it
            const aiMessage = await getAIResponse(conversation);
            conversation.push({ role: "assistant", content: aiMessage });
            addMessageToChat('bot', aiMessage);
        }
    }

    // Listen for form submission
    document.getElementById('chatForm').addEventListener('submit', handleUserInput);
}

// Initialize the chat interface
initChat();
