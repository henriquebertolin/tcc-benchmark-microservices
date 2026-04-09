import { handler } from "./handler";

const event = {
  httpMethod: "GET",
  path: "/health"
};

handler(event as any, {} as any).then((res) => {
  console.log(res);
});