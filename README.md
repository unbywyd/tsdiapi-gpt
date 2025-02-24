# **🚀 TSDIAPI GPT Plugin**

A **TSDIAPI** plugin that provides seamless integration with OpenAI's GPT models, allowing structured responses, JSON-based AI output, and customizable chat interactions.

---

## 📦 **Installation**

Install the plugin via **npm**:

```bash
npm install --save @tsdiapi/gpt
```

Then, register the plugin in your **TSDIAPI** project:

```typescript
import { createApp } from "@tsdiapi/server";
import createPlugin from "@tsdiapi/gpt";

createApp({
  plugins: [
    createPlugin({
      apiKey: "your-openai-api-key", // Required
      model: "gpt-4o-mini", // Optional (default: gpt-4o-mini)
    }),
  ],
});
```

---

## 🚀 **Features**

- 🔥 **Structured JSON Responses** – Generate structured AI responses based on DTO classes.
- 🛠 **Automatic Schema Generation** – Uses `class-validator-jsonschema` to create JSON schemas from DTOs.
- ⚡ **Multi-Model Support** – Works with various OpenAI models like `gpt-4o`, `gpt-3.5-turbo`, and more.
- 🎯 **Text and JSON Output** – Supports standard chat completion and structured JSON responses.

---

## 🔧 **Configuration Options**

| Option   | Type     | Default         | ENV Variable      | Description                 |
| -------- | -------- | --------------- | ----------------- | --------------------------- |
| `apiKey` | `string` | `""`            | `OPENAI_API_KEY`  | OpenAI API Key _(Required)_ |
| `model`  | `string` | `"gpt-4o-mini"` | `OPENAI_MODEL_ID` | Default model to use        |

---

## 📌 **How to Use**

### ✅ **Structured JSON Output (DTO-based)**

Generate structured JSON responses from OpenAI using DTOs.

```typescript
import { getGPTProvider } from "@tsdiapi/gpt";
import { IsString, IsEmail } from "class-validator";
import { Expose } from "class-transformer";

class UserDTO {
  @IsString()
  @Expose()
  name: string;

  @IsEmail()
  @Expose()
  email: string;
}

async function run() {
  const gpt = getGPTProvider();
  const response = await gpt.jsonDTO("Generate a random user", UserDTO);
  console.log(response);
}

run();
```

🔹 **GPT will return a structured response following `UserDTO` schema.**

---

### ✅ **Basic Chat Completion**

Perform a simple text-based GPT completion:

```typescript
import { getGPTProvider } from "@tsdiapi/gpt";

async function run() {
  const gpt = getGPTProvider();
  const response = await gpt.chat("Tell me a joke");
  console.log(response.result);
}

run();
```

---

### ✅ **Raw JSON Response**

Send a JSON schema manually:

```typescript
import { getGPTProvider } from "@tsdiapi/gpt";

const jsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
  },
  required: ["title", "description"],
};

async function run() {
  const gpt = getGPTProvider();
  const response = await gpt.JsonString("Describe a cat", jsonSchema);
  console.log(response);
}

run();
```

---

## 📌 **Example Response (Structured Output)**

```json
{
  "message": {
    "role": "assistant",
    "content": "{ \"name\": \"John Doe\", \"email\": \"johndoe@example.com\" }"
  },
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 15,
    "total_tokens": 35
  },
  "result": {
    "name": "John Doe",
    "email": "johndoe@example.com"
  }
}
```

---

## **📌 Related Plugins**

Explore other **TSDIAPI** plugins:
🔗 [Available Plugins](https://www.npmjs.com/search?q=%40tsdiapi)

---

## 👨‍💻 **Contributing**

Contributions are welcome! If you have ideas for improvements, open an issue or submit a pull request.

**Author:** [unbywyd](https://github.com/unbywyd)  
📧 **Contact:** unbywyd@gmail.com

🚀 Happy coding with **TSDIAPI GPT Plugin**! 🎉
