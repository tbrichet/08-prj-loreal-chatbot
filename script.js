/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Array to track conversation context
const messages = [
  {
    role: "system",
    content:
      "You are a helpful and knowledgeable chatbot trained to answer questions specifically about L’Oréal products, including skincare, haircare, cosmetics, and beauty routines. Only respond to questions that relate directly to L’Oréal’s product lines, usage tips, ingredients, or personalized beauty recommendations based on L’Oréal offerings. If a question falls outside this scope, politely redirect the user to ask about L’Oréal products or routines.",
  }
];

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  messages.push({ role: "user", content: userInput.value });
  // Get user input
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Add user message to the conversation context
  messages.push({ role: "user", content: userMessage });

  // Display user message in the chat window
  chatWindow.innerHTML += `<div class="msg user">${userMessage}</div>`;
  userInput.value = ""; // Clear input field

  // Display loading message
  chatWindow.innerHTML += `<div class="msg ai">Thinking...</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Send POST request to the Cloudflare Worker
    const response = await fetch(
      "https://project8workerbetatest.tara-brichetto.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      }
    );

    // Parse the response
    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Add AI response to the conversation context
    messages.push({ role: "assistant", content: aiMessage });

    // Display the user's latest question above the AI's response
    chatWindow.innerHTML += `
      <div class="msg user latest-question">Your Question: ${userMessage}</div>
      <div class="msg ai">${aiMessage}</div>
    `;

    // Remove the previous "latest question" if it exists
    const previousLatestQuestion = document.querySelector(".latest-question");
    if (previousLatestQuestion) {
      previousLatestQuestion.remove();
    }
  } catch (error) {
    // Handle errors
    chatWindow.innerHTML += `<div class="msg ai">Sorry, something went wrong. Please try again later.</div>`;
    console.error("Error:", error);
  }

  // Scroll to the latest message
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
