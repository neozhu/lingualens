# **LinguaLens Translation Assistant**

**LinguaLens** is an intelligent translation assistant that supports bidirectional translation between Chinese and other languages. It adapts to different contexts and scenarios such as email, online meetings, technical support, and more. The tool intelligently selects the tone, formality, and style of the translation based on the chosen scene, ensuring accurate and contextually appropriate translations.

![](/public/screen.png)

## **Features**

* **Bidirectional Translation**: Automatically translates Chinese to English and any non-Chinese language (e.g., English, French, German) to Chinese.
* **Scene-based Context**: Tailors translations based on the context of specific work-related scenarios like online meetings, emails, Teams chats, and technical support.
* **Custom Scene Management**: Create, edit, delete, and reorder your own custom translation scenes with a user-friendly interface. All custom scenes are saved in your browser's localStorage.
* **Multilingual Support**: Currently supports translations between Chinese and several other languages, including English, French, German, etc.
* **Customizable User Interface**: Easily switch between different scenes for translations, ensuring the tone and style fit the specific use case.
* **User-Friendly Design**: Built with **Next.js** and **ShadCN UI**, making the interface simple and intuitive.
* **Supports Gemini 2.5 Flash Preview 04-17**: You can choose the Gemini 2.5 Flash Preview 04-17 model, which provides excellent translation quality.

## **Tech Stack**

* **Frontend**: Next.js 15 (App Router)
* **UI Components**: Shadcn/UI
* **State Management**: Zustand (for lightweight state management and history tracking)
* **AI Translation Service**: Powered by **Google Gemini** or any other AI model, providing accurate translations based on the context and input language.
* **Backend**: API integration with AI services for streaming responses up to 30 seconds.
* **CSS**: Tailwind CSS for styling
* **Language Detection**: Automatically detects the language of input text and translates it to the appropriate target language.

## **How It Works**

1. **Language Detection**: The AI detects the language of the input text. If the input is in **Chinese**, it translates it into **English**. If the input is in any other language (e.g., **English**, **French**, **German**), it translates it into **Chinese**.
2. **Scene Selection**: Users can select the translation scene (e.g., **Email**, **Online Meeting**, **Technical Support**). The AI adjusts the tone and formality of the translation based on the selected scene.
3. **Custom Scene Creation**: Users can create their own custom translation scenes by clicking the "自定义场景" (Custom Scene) button and using the scene management interface.
4. **Real-Time Translation**: The translation process takes place in real-time, providing instant feedback for quick and accurate translations.

## **Scenes**

Below are the translation scenes I believe are most commonly used in the workplace:

- **Daily Communication**: Casual, friendly exchanges between colleagues or friends, using common vocabulary and simple grammar.
- **Email**: For professional business email communication.
- **News Article**: For translating news reports or informational articles. Maintains objectivity, neutrality, and accuracy.
- **Word Explanation**: For simple, memorable explanations and practical example sentences of a word or phrase, in both English and Chinese.
- **Technical Documentation**: For translating developer technical documentation or API references. Uses a professional tone, consistent terminology, and clear, structured presentation.
- **Social Media Post (X/Reddit)**: For engaging posts on X (Twitter) or Reddit.
- **Technical Support**: For technical support communication in systems like TOPdesk, focusing on Salesforce, JavaScript, .NET, or SAP.
- **Meeting Invitation**: For formal meeting invitation messages.
- **Requirement Discussion**: For discussions about## **Scenes**

## **Getting Started**

To run **LinguaLens** locally, follow these steps:

### **1. Clone the repository**

```bash
git clone https://github.com/neozhu/lingualens.git
cd lingualens
```

### **2. Install dependencies**

Use `pnpm` or `npm` to install the project dependencies.

```bash
pnpm install
# Or if you're using npm:
npm install
```

### **3. Set up environment variables**

Create a `.env.local` file in the root directory and add your environment-specific variables, such as API keys for the AI translation service.

> **Note:** These API keys can be obtained for free by registering an account, or you can use a paid account if you need higher usage limits.


```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=<your API key>
MISTRAL_API_KEY=<your API key>
```

### **4. Run the project**

After setting up the environment variables, you can start the development server:

```bash
pnpm dev
# Or if you're using npm:
npm run dev
```

Visit `http://localhost:3000` in your browser to access the app.

## **Docker Deployment**

You can deploy **LinguaLens** using Docker for easy setup and consistent environments.

### **1. Pull the latest code**

```bash
git pull
```

### **2. Build the Docker image**

```bash
sudo docker build . -t lingualens:ver
```

Replace `ver` with your desired version tag (e.g., `v0.24`).

### **3. (Optional) Use Docker Compose**

Below is an example `docker-compose.yml` file for running LinguaLens:

```yaml
version: '3.8'

services:
  lingualens:
    image: lingualens:v0.24
    # Map external port 4010 to internal port 3000
    ports:
      - "4010:3000"
    # Set environment variables
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_GA_ID=<your tag id>
      - GROQ_API_KEY=<your api key>
      - GOOGLE_GENERATIVE_AI_API_KEY=<your api key>
      - OPENAI_API_KEY=<your API key>
      - MISTRAL_API_KEY=<your API key>
    restart: unless-stopped
```

### **4. Start the service**

```bash
sudo docker compose up -d
```

Visit `http://localhost:4010` in your browser to access the app running in Docker.

## **Usage**

1. **Select a Scene**: Choose the context for the translation (e.g., **Online Meeting**, **Email**) or create your own custom scenes.
2. **Input Text**: Type or paste the text you want to translate in either **Chinese** or another language.
3. **Receive Translation**: The AI will process the translation and output the result in the target language (English for Chinese input, or Chinese for other language inputs).

## **Custom Scene Management**

The new custom scene management feature allows you to:

1. **Create Custom Scenes**: Create your own translation scenes with specific prompts, names, and descriptions.
2. **Edit Existing Scenes**: Modify any custom scene to fine-tune the translation style and context.
3. **Delete Scenes**: Remove any custom scenes you no longer need.
4. **Reorder Scenes**: Drag and drop to reorder your scenes according to your preference.
5. **Reset to Default**: Return to the default set of scenes at any time.

All custom scenes are automatically saved in your browser's localStorage and will be available when you return to the application.

## **Contributing**

We welcome contributions to **LinguaLens**! If you’d like to improve the project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a clear explanation of the changes.

## **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## **Acknowledgments**

* Thanks to the **AI SDK** for providing the AI services used in the project.
* Inspired by **Shadcn/UI** for building responsive and customizable UI components.
* Special thanks to the **Google Gemini** team for their AI-powered translation capabilities.


