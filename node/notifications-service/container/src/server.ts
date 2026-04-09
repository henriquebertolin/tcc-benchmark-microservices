import { buildApp } from "../../common/src/app";

const app = buildApp();

app.listen({ port: 3002, host: "0.0.0.0" }).then(() => {
  console.log("Server running on http://localhost:3002");
});