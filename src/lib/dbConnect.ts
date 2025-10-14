import { promises } from "dns";
import mongoose from "mongoose";
import { ca } from "zod/v4/locales";


type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {}


async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("already connected");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {});

        connection.isConnected = db.connections[0].readyState;
        console.log("connected to db");

    }catch (error) {
        console.log("error connecting to db", error);

        process.exit(1);
    }
}

export default dbConnect;