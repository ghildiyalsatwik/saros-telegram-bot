import { buildSubscribeRequest } from "./requestBuilder.js";
import { attachStreamHandlers } from "./handlers.js";

let stream: any | null = null;

export async function startStream(client: any) {
    
    const request = await buildSubscribeRequest();

  if(!request) {
    
    console.log("No pools yet, GRPC stream not started");
    
    return;
  }

  console.log("GRPC stream started");

  stream = await client.subscribe();
  
  attachStreamHandlers(stream);

  stream.write(request);

}

export function getStream() {
    
    if(!stream) throw new Error("Stream not initialized");
    
    return stream;
}
  
export async function updateStreamSubscription() {
    
    const request = await buildSubscribeRequest();
    
    if(!request) return;
    
    stream?.write(request);
}