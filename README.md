# **🚀 TSDIAPI GPT Plugin**

A **TSDIAPI** plugin that provides seamless integration with OpenAI's GPT models, enabling structured JSON output using [TypeBox](https://github.com/sinclairzx81/typebox) schemas and flexible chat interactions.

---

## 📦 Installation

```bash
npm install --save @tsdiapi/gpt @sinclair/typebox
```

Then register the plugin in your **TSDIAPI** app:

```ts
import { createApp } from "@tsdiapi/server";
import createPlugin from "@tsdiapi/gpt";

createApp({
  plugins: [
    createPlugin({
      apiKey: "your-openai-api-key", // Required
      model: "gpt-4o-mini",          // Optional (default)
    }),
  ],
});
```

---

## 🚀 Features

- 📘 **Structured JSON output** with [TypeBox](https://github.com/sinclairzx81/typebox)
- 🧠 **Model-agnostic**: Supports `gpt-4o`, `gpt-3.5-turbo`, etc.
- ✨ **Prompt-to-structured-object** in one call
- ⚡ **Simple chat** and **typed response** support
- 🧩 **Composable schemas** and type inference

---

## 🔧 Configuration Options

| Option   | Type     | Default         | ENV Variable      | Description                 |
|----------|----------|-----------------|-------------------|-----------------------------|
| `apiKey` | `string` | `""`            | `OPENAI_API_KEY`  | OpenAI API Key _(Required)_ |
| `model`  | `string` | `"gpt-4o-mini"` | `OPENAI_MODEL_ID` | Default GPT model           |

---

## 📌 How to Use

### ✅ Structured JSON Output (via TypeBox)

```ts
import { Type } from "@sinclair/typebox";
import { useGPTProvider } from "@tsdiapi/gpt";

const UserSchema = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" }),
});

async function run() {
  const gpt = useGPTProvider();
  const response = await gpt.jsonDTO("Generate a user", UserSchema);
  console.log(response?.result);
}
```

> 🧠 You get a strongly typed `result` conforming to `UserSchema`, with automatic type casting (no validation errors thrown).

---

### 💬 Basic Chat Completion

```ts
import { useGPTProvider } from "@tsdiapi/gpt";

async function run() {
  const gpt = useGPTProvider();
  const response = await gpt.chat("Tell me a dad joke.");
  console.log(response?.result);
}
```

---

### 🧾 Raw JSON Schema

You can also pass a plain JSON Schema manually:

```ts
const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
  },
  required: ["title", "description"],
};

const gpt = useGPTProvider();
const response = await gpt.JsonString("Describe a new product", schema);
console.log(response);
```

---

## 📦 Example Response

```json
{
  "message": {
    "role": "assistant",
    "content": "{ \"name\": \"Jane\", \"email\": \"jane@example.com\" }"
  },
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 15,
    "total_tokens": 35
  },
  "result": {
    "name": "Jane",
    "email": "jane@example.com"
  }
}
```

---

## 🔌 Related Plugins

Check out more plugins in the **TSDIAPI** ecosystem:

👉 [Explore @tsdiapi plugins on npm](https://www.npmjs.com/search?q=%40tsdiapi)

---

## 👨‍💻 Contributing

Have ideas? Want to add more features? PRs and issues are welcome!

**Author:** [unbywyd](https://github.com/unbywyd)  
📧 **Contact:** unbywyd@gmail.com

---

🚀 Happy coding with **TSDIAPI GPT Plugin**!